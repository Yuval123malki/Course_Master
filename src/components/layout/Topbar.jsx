import React from 'react';
import { Menu, ChevronLeft, Search, Sun, Moon, Printer } from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { StudyTimer } from '../common/StudyTimer';
import { navigate } from '../../utils/dom';

const ROUTE_TITLES = {
  home: 'דף הבית',
  calendar: 'יומן בחינה ויעדים',
  progress: 'מדדי שליטה והתקדמות',
  plan: 'תוכנית לימוד',
  chapters: 'פרקי לימוד',
  lab: 'מעבדה והמחשות',
  complexity: 'טבלאות סיבוכיות',
  map: 'מפת הקורס',
  tools: 'כלי עזר ומחשבונים',
  practice: 'בנק שאלות',
  simulations: 'סימולציות מבחן',
  exams: 'ארכיון בחינות',
  patterns: 'תבניות פתרון',
  cards: 'כרטיסיות זיכרון',
  review: 'דף נוסחאות ויום לפני',
  errors: 'מאגר טעויות לחיזוק',
  bookmarks: 'שאלות שמורות',
  studypack: 'סיכומי הרצאות ו-AI',
  courses: 'ספריית הקורסים',
  studio: 'ספריית הקורסים',
  settings: 'הגדרות וגיבוי',
  help: 'מדריך ועזרה',
  sources: 'מקורות הקורס',
  privacy: 'מדיניות פרטיות',
  terms: 'תנאי שימוש',
  cookies: 'קוקיז ואחסון',
  accessibility: 'הצהרת נגישות'
};

export function Topbar({ currentRoute, setMobileOpen, openSearch, openAccount, openExportPdf }) {
  const { activeCourse } = useCourse();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const currentCourseInfo = activeCourse?.courseData?.COURSE || {};

  const getPageTitle = () => {
    if (ROUTE_TITLES[currentRoute]) return ROUTE_TITLES[currentRoute];
    if (currentRoute.startsWith('studio/edit')) return 'עריכת תוכן הקורס';
    if (currentRoute.startsWith('chapter/')) {
      const id = currentRoute.split('/')[1];
      const t = activeCourse?.courseData?.TOPICS?.find(item => item.id === id);
      return t?.title || 'פרק לימוד';
    }
    if (currentRoute.startsWith('question/')) return 'תרגול שאלה';
    if (currentRoute.startsWith('sim/')) return 'סימולציית מבחן';
    return currentCourseInfo.name || 'סביבת הלמידה';
  };

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          className="mobile-menu icon-button"
          aria-label="פתח תפריט"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} />
        </button>

        <div className="breadcrumb">
          <span
            onClick={() => navigate('home')}
            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {currentCourseInfo.name || 'הקורס שלי'}
          </span>
          <ChevronLeft size={14} />
          <b>{getPageTitle()}</b>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Search Trigger */}
        <button
          className="search-trigger"
          onClick={openSearch}
          aria-label="חיפוש בכל הקורס (⌘K)"
          title="חיפוש מהיר (⌘K)"
        >
          <Search size={14} />
          <span>חיפוש מהיר...</span>
          <kbd>⌘K</kbd>
        </button>

        {/* Compact Study Timer */}
        <StudyTimer isCompact={true} />

        {/* PDF Summary Sheet */}
        {openExportPdf && (
          <button
            className="icon-button"
            onClick={openExportPdf}
            title="דף נוסחאות וסיכום להדפסה (PDF)"
            aria-label="דף נוסחאות להדפסה"
          >
            <Printer size={15} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
          title={theme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Clean User Profile Pill */}
        <button
          onClick={openAccount}
          title={`פרופיל סטודנט: ${currentUser?.name || 'סטודנט'} (יעד: ${currentUser?.targetGrade || 90})`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 34,
            padding: '0 10px',
            borderRadius: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentUser?.avatar || '🎓'}</span>
          <span>{currentUser?.name?.split(' ')[0] || 'סטודנט'}</span>
        </button>
      </div>
    </header>
  );
}
