import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataStructuresCourse } from '../data/courses/dataStructures';
import { dataStructuresVercelCourse } from '../data/courses/dataStructuresVercel';
import { discreteMathCourse } from '../data/courses/discreteMath';
import { linearAlgebraCourse } from '../data/courses/linearAlgebra';
import { webDevCourse } from '../data/courses/webDev';

const CUSTOM_COURSES_STORAGE_KEY = 'courseforge_custom_courses_v1';
const ACTIVE_COURSE_KEY = 'courseforge_active_course_v1';

const PRELOADED_COURSES = [
  dataStructuresCourse,
  dataStructuresVercelCourse,
  discreteMathCourse,
  linearAlgebraCourse,
  webDevCourse
];

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_COURSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const preloadedMap = Object.fromEntries(PRELOADED_COURSES.map(c => [c.id, c]));
        const customMap = Object.fromEntries(parsed.map(c => [c.id, c]));
        const combined = { ...preloadedMap };
        for (const [id, c] of Object.entries(customMap)) {
          combined[id] = { ...combined[id], ...c };
        }
        return Object.values(combined);
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage', e);
    }
    return PRELOADED_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_COURSE_KEY);
      if (savedId) {
        return savedId;
      }
    } catch (e) {}
    return 'ds';
  });

  // Try fetching courses from local server API on startup if available
  useEffect(() => {
    fetch('/api/courses')
      .then(res => (res.ok ? res.json() : null))
      .then(db => {
        if (db && Array.isArray(db.courses) && db.courses.length > 0) {
          const preloadedMap = Object.fromEntries(PRELOADED_COURSES.map(c => [c.id, c]));
          const serverMap = Object.fromEntries(db.courses.map(c => [c.id, c]));
          const combined = { ...preloadedMap };
          for (const [id, srv] of Object.entries(serverMap)) {
            const pre = combined[id];
            combined[id] = pre
              ? {
                  ...pre,
                  ...srv,
                  courseData: srv.courseData || pre.courseData,
                  examsData: srv.examsData || pre.examsData,
                  patternsData: srv.patternsData || pre.patternsData,
                  syllabusData: srv.syllabusData || pre.syllabusData,
                  inventoryData: srv.inventoryData || pre.inventoryData
                }
              : srv;
          }
          setCourses(Object.values(combined));
          if (db.activeCourseId) {
            setActiveCourseId(db.activeCourseId);
          }
        }
      })
      .catch(() => {
        // Server API not running; localStorage takes over seamlessly
      });
  }, []);

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0] || dataStructuresCourse;

  const selectCourse = (id) => {
    if (courses.some(c => c.id === id)) {
      setActiveCourseId(id);
      try {
        localStorage.setItem(ACTIVE_COURSE_KEY, id);
      } catch (e) {}

      // Inform backend if running
      fetch('/api/active-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeCourseId: id })
      }).catch(() => {});
    }
  };

  const saveCustomCourses = (updatedCoursesList) => {
    try {
      const preloadedIds = new Set(PRELOADED_COURSES.map(c => c.id));
      const customOnly = updatedCoursesList.filter(c => !preloadedIds.has(c.id) || c.isModified);
      localStorage.setItem(CUSTOM_COURSES_STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to save custom courses', e);
    }
  };

  const createCourse = (newCourse) => {
    const courseWithMeta = {
      ...newCourse,
      id: newCourse.id || `course-${Date.now()}`,
      createdAt: Date.now(),
      isCustom: true
    };
    const updated = [courseWithMeta, ...courses];
    setCourses(updated);
    saveCustomCourses(updated);
    selectCourse(courseWithMeta.id);

    // Sync to backend if running
    fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: courseWithMeta })
    }).catch(() => {});

    return courseWithMeta;
  };

  const updateCourse = (id, updatedData) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        const item = { ...c, ...updatedData, isModified: true, updatedAt: Date.now() };
        fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course: item })
        }).catch(() => {});
        return item;
      }
      return c;
    });
    setCourses(updated);
    saveCustomCourses(updated);
  };

  const deleteCourse = (id) => {
    const remaining = courses.filter(c => c.id !== id);
    setCourses(remaining);
    saveCustomCourses(remaining);
    if (activeCourseId === id) {
      selectCourse(remaining[0]?.id || 'ds');
    }

    // Inform backend
    fetch(`/api/courses/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourse,
        activeCourseId,
        selectCourse,
        createCourse,
        updateCourse,
        deleteCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return ctx;
}
