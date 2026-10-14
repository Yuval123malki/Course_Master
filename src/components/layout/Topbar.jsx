import React from 'react';
import { Menu, ChevronLeft, Search, User, Sparkles, Sun, Moon, Flame, Printer } from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { StudyTimer } from '../common/StudyTimer';
import { NAV_GROUPS } from './Sidebar';
import { navigate, getProgressValue } from '../../utils/dom';

export function Topbar({ currentRoute, setMobileOpen, openSearch, openAccount, openExportPdf, store }) {
  const { courses, activeCourse, activeCourseId, selectCourse } = useCourse();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const currentCourseInfo = activeCourse?.courseData?.COURSE || {};

  const getPageTitle = () => {
    if (currentRoute === 'courses' || currentRoute === 'studio') return 'דשבורד המאסטר';
    if (currentRoute.startsWith('studio/edit')) return 'עורך תוכן הקורס';
    if (currentRoute === 'studio/new') return 'יצירת קורס חדש';

    const flat = NAV_GROUPS.flatMap(g => g.items);
    const matched = flat.find(i => i.path === currentRoute);
    if (matched) return matched.label;
    if (currentRoute.startsWith('chapter/')) {
      const id = currentRoute.split('/')[1];
      const t = activeCourse?.courseData?.TOPICS?.find(item => item.id === id);
      return t?.title || 'פרק לימוד';
    }
    if (currentRoute.startsWith('question/')) return 'תרגול שאלה';
    if (currentRoute.startsWith('sim/')) return 'סימולציה';
    const legal = {
      privacy: 'מדיניות פרטיות',
      terms: 'תנאי שימוש',
      cookies: 'קוקיז ואחסון',
      accessibility: 'הצהרת נגישות'
    };
    return legal[currentRoute] || currentCourseInfo.name || 'מערכת הלמידה';
  };

  const solvedCount = Object.keys(store?.progress?.entries || {}).filter(
    k => k.startsWith('question:') && store.progress.entries[k]?.value?.status
  ).length;

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          className="mobile-menu icon-button"
          aria-label="פתח תפריט"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* Course Switcher Dropdown */}
        <div className="course-switcher-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            className="course-dropdown-select"
            value={activeCourseId}
            onChange={e => {
              selectCourse(e.target.value);
              navigate('home');
            }}
            title="בחר קורס ללמידה או עריכה"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.courseData?.COURSE?.name || c.id} ({c.courseData?.COURSE?.code || ''})
              </option>
            ))}
          </select>
        </div>

        <div className="breadcrumb">
          <ChevronLeft size={14} />
          <b>{getPageTitle()}</b>
        </div>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Compact Study Timer */}
        <StudyTimer isCompact={true} />

        {/* Solved / Streak Counter Pill */}
        {solvedCount > 0 && (
          <div
            className="pill priority-a"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: '0.8rem' }}
            title={`${solvedCount} שאלות נפתרו בהצלחה`}
          >
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <span>{solvedCount} נפתרו</span>
          </div>
        )}

        {/* Master Studio Button */}
        <button
          className="studio-btn"
          onClick={() => navigate('courses')}
          title="סטודיו המאסטר — ניהול ובחירת קורסים"
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>סטודיו המאסטר</span>
        </button>

        {/* PDF Cheat-Sheet / Summary Export */}
        {openExportPdf && (
          <button
            className="theme-toggle-btn"
            onClick={openExportPdf}
            title="ייצוא סיכום ודף נוסחאות להדפסה / PDF"
            aria-label="דף נוסחאות להדפסה"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <Printer size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>סיכום PDF</span>
          </button>
        )}

        {/* Search Trigger */}
        <button
          className="search-trigger"
          onClick={openSearch}
          aria-label="חיפוש בכל הקורס (⌘K)"
          title="חיפוש מהיר (⌘K)"
        >
          <Search size={16} />
          <span>חיפוש</span>
          <kbd>⌘ K</kbd>
        </button>

        {/* Theme Toggle (Dark / Light / White mode) */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'עבור למצב בהיר (White Mode)' : 'עבור למצב כהה (Dark Mode)'}
          title={theme === 'dark' ? 'עבור למצב בהיר (White Mode)' : 'עבור למצב כהה (Dark Mode)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: theme === 'dark' ? 'var(--amber)' : 'var(--indigo)'
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {theme === 'dark' ? 'בהיר' : 'כהה'}
          </span>
        </button>

        {/* User Profile Button */}
        <button
          className="user-profile-btn"
          onClick={openAccount}
          title={`פרופיל סטודנט: ${currentUser?.name || 'משתמש'} (יעד: ${currentUser?.targetGrade || 90})`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 12px',
            borderRadius: 999,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{currentUser?.avatar || '🎓'}</span>
          <b style={{ maxWidth: 90, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser?.name?.split(' ')[0] || 'סטודנט'}
          </b>
          <span
            className="pill"
            style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              background: 'var(--primary-soft)',
              color: 'var(--primary-hover)',
              fontWeight: 700
            }}
          >
            {currentUser?.targetGrade || 90}
          </span>
        </button>
      </div>
    </header>
  );
}

