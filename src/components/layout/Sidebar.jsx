import React from 'react';
import {
  Home,
  BookOpen,
  HelpCircle,
  Layers,
  Wand2,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  FolderKanban
} from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { navigate } from '../../utils/dom';

export const NAV_GROUPS = [
  {
    name: 'מרחב למידה',
    items: [
      {
        label: 'דף הבית ויומן',
        icon: <Home size={17} />,
        path: 'home',
        match: ['home', 'calendar', 'progress', 'plan']
      },
      {
        label: 'פרקים ומעבדה',
        icon: <BookOpen size={17} />,
        path: 'chapters',
        match: ['chapters', 'lab', 'complexity', 'map', 'tools']
      },
      {
        label: 'תרגול ומבחנים',
        icon: <HelpCircle size={17} />,
        path: 'practice',
        match: ['practice', 'simulations', 'exams', 'patterns']
      },
      {
        label: 'כרטיסיות וחזרה',
        icon: <Layers size={17} />,
        path: 'cards',
        match: ['cards', 'review', 'errors', 'bookmarks']
      },
      {
        label: 'סיכומים ו-AI',
        icon: <Wand2 size={17} />,
        path: 'studypack',
        match: ['studypack']
      }
    ]
  },
  {
    name: 'מערכת',
    items: [
      {
        label: 'ספריית הקורסים',
        icon: <FolderKanban size={17} />,
        path: 'courses',
        match: ['courses', 'studio']
      },
      {
        label: 'הגדרות וגיבוי',
        icon: <Settings size={17} />,
        path: 'settings',
        match: ['settings', 'help', 'sources']
      }
    ]
  }
];

export function Sidebar({ currentRoute, isMobileOpen, setMobileOpen, isCollapsed, setCollapsed, store }) {
  const { courses, activeCourse, activeCourseId, selectCourse } = useCourse();
  const courseInfo = activeCourse?.courseData?.COURSE || {};

  const isCurrent = (item) => {
    if (currentRoute === item.path) return true;
    if (item.match?.includes(currentRoute)) return true;
    if (item.path === 'chapters' && currentRoute.startsWith('chapter/')) return true;
    if (item.path === 'practice' && (currentRoute.startsWith('question/') || currentRoute.startsWith('sim/'))) return true;
    if (item.path === 'courses' && currentRoute.startsWith('studio')) return true;
    return false;
  };

  const syncText = store.sync || 'נשמר אוטומטית במכשיר';

  return (
    <aside
      id="course-navigation"
      className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      aria-label="ניווט ראשי"
    >
      <div
        className="brand"
        onClick={() => navigate('home')}
        style={{ cursor: 'pointer' }}
        title="Course_Master · חזרה לדף הבית"
      >
        <div className="brand-mark" aria-hidden="true">
          <svg width="21" height="21" viewBox="0 0 192 192" fill="none">
            <path
              d="M36 122V58L72 92L96 46L120 92L156 58V122"
              stroke="#ffffff"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="48" y="144" width="96" height="16" rx="8" fill="rgba(255,255,255,0.8)" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} dir="ltr">
            <strong
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)'
              }}
            >
              Course<span style={{ color: 'var(--primary)' }}>_</span>Master
            </strong>
          </div>
          <small style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {courseInfo.name || 'מערכת הלמידה ומאגרי הקורסים'}
          </small>
        </div>
        <button
          className="close-drawer"
          aria-label="סגור תפריט"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(false);
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Clean Course Switcher right inside Sidebar */}
      <div className="sidebar-course-picker">
        <select
          className="sidebar-course-select"
          value={activeCourseId}
          aria-label="בחר קורס פעיל"
          onChange={e => {
            if (e.target.value === '__new__') {
              navigate('courses?new=1');
              setMobileOpen(false);
              return;
            }
            selectCourse(e.target.value);
            if (currentRoute === 'courses' || currentRoute.startsWith('studio')) {
              navigate('home');
            }
          }}
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.courseData?.COURSE?.name || c.id}
            </option>
          ))}
          <option value="__new__">+ הוסף קורס חדש...</option>
        </select>
      </div>

      <nav aria-label="תפריט הקורס">
        {NAV_GROUPS.map(group => (
          <div key={group.name} className="nav-group">
            <p>{group.name}</p>
            {group.items.map(item => {
              const active = isCurrent(item);
              return (
                <button
                  key={item.path}
                  className={active ? 'active' : ''}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className=" status-line sidebar-sync" title={syncText}>
          <span className="sync-dot connected" />
          <span>{syncText}</span>
        </div>
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
          title={isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          <span>{isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}</span>
        </button>
      </div>
    </aside>
  );
}
