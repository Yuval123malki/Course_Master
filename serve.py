#!/usr/bin/env python3
"""
CourseForge Master Platform — Local HTTP Server & Course Database API
Provides static hosting with strict no-cache headers, plus REST endpoints
for local course database persistence on disk (data/courses_db.json).
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
DB_FILE = os.path.join(BASE_DIR, "data", "courses_db.json")

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[DB Error] Failed to read DB: {e}")
    return {"activeCourseId": "ds", "courses": []}

def save_db(data):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class CourseForgeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def end_headers(self):
        # Strict anti-cache headers so browser always loads fresh code and data
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length <= 0:
            return {}
        raw = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/courses':
            db = load_db()
            self.send_json(200, db)
            return

        if path == '/api/active-course':
            db = load_db()
            self.send_json(200, {"activeCourseId": db.get("activeCourseId", "ds")})
            return

        if path == '/api/status':
            db = load_db()
            courses = db.get("courses", [])
            self.send_json(200, {
                "status": "online",
                "activeCourseId": db.get("activeCourseId", "ds"),
                "coursesCount": len(courses),
                "courseIds": [c.get("id") for c in courses if isinstance(c, dict)]
            })
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/courses':
            body = self.read_json_body()
            course = body.get('course', body)
            if not isinstance(course, dict) or not course.get('id'):
                self.send_json(400, {"error": "Invalid course object. 'id' is required."})
                return

            db = load_db()
            courses = db.get("courses", [])
            # Update if exists, or append
            updated = False
            for i, c in enumerate(courses):
                if isinstance(c, dict) and c.get('id') == course['id']:
                    courses[i] = course
                    updated = True
                    break
            if not updated:
                courses.insert(0, course)

            db["courses"] = courses
            # Set as active course
            db["activeCourseId"] = course['id']
            save_db(db)

            print(f"✅ [CourseForge DB] Saved course: {course.get('id')} ({course.get('name') or course.get('courseData', {}).get('COURSE', {}).get('name')})")
            self.send_json(200, {"success": True, "activeCourseId": db["activeCourseId"], "course": course})
            return

        if path == '/api/active-course':
            body = self.read_json_body()
            course_id = body.get('activeCourseId') or body.get('id')
            if not course_id:
                self.send_json(400, {"error": "Missing 'activeCourseId' or 'id'"})
                return

            db = load_db()
            db["activeCourseId"] = course_id
            save_db(db)
            print(f"🎯 [CourseForge DB] Active course set to: {course_id}")
            self.send_json(200, {"success": True, "activeCourseId": course_id})
            return

        if path == '/api/reset':
            # Reset active course to 'ds'
            db = load_db()
            db["activeCourseId"] = "ds"
            save_db(db)
            self.send_json(200, {"success": True, "activeCourseId": "ds"})
            return

        self.send_json(404, {"error": "Endpoint not found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/courses/'):
            course_id = path[len('/api/courses/'):].strip()
            if not course_id or course_id == 'ds':
                self.send_json(400, {"error": "Cannot delete default 'ds' course"})
                return

            db = load_db()
            courses = db.get("courses", [])
            new_courses = [c for c in courses if isinstance(c, dict) and c.get('id') != course_id]
            db["courses"] = new_courses
            if db.get("activeCourseId") == course_id:
                db["activeCourseId"] = "ds"
            save_db(db)

            print(f"🗑️ [CourseForge DB] Deleted course: {course_id}")
            self.send_json(200, {"success": True, "activeCourseId": db["activeCourseId"]})
            return

        self.send_json(404, {"error": "Endpoint not found"})

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CourseForgeHandler) as httpd:
        url = f"http://localhost:{PORT}/"
        print("=" * 65)
        print("🎓 CourseForge Master Platform — Local Server & Database Ready")
        print(f"🌐 כתובת המערכת: {url}")
        print(f"🗄️  מאגר הנתונים המקומי: {DB_FILE}")
        print("=" * 65)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nהשרת נעצר.")
