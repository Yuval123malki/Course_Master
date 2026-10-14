import React from 'react';
import {
  Home,
  Map,
  Calendar,
  BookOpen,
  FlaskConical,
  Clock,
  HelpCircle,
  FileCheck2,
  FileText,
  Shapes,
  Timer,
  AlertTriangle,
  Layers,
  Bookmark,
  CheckSquare,
  BarChart2,
  FolderArchive,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Lock,
  ArrowLeftRight,
  GraduationCap,
  Wand2
} from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { navigate } from '../../utils/dom';

export const NAV_GROUPS = [
  {
    name: 'למידה',
    items: [
      { label: 'דף הבית', icon: <Home size={18} />, path: 'home' },
      { label: 'מחולל Study Pack', icon: <Wand2 size={18} />, path: 'studypack' },
      { label: 'פרקי לימוד', icon: <BookOpen size={18} />, path: 'chapters' },
      { label: 'מעבדה והמחשות', icon: <FlaskConical size={18} />, path: 'lab' },
      { label: 'סיבוכיות ונוסחאות', icon: <Clock size={18} />, path: 'complexity' }
    ]
  },
  {
    name: 'תרגול ומבחנים',
    items: [
      { label: 'בנק שאלות', icon: <HelpCircle size={18} />, path: 'practice' },
      { label: 'סימולציות מבחן', icon: <Timer size={18} />, path: 'simulations' },
      { label: 'יומן מבחנים ויעדים', icon: <Calendar size={18} />, path: 'calendar' },
      { label: 'ניתוח בחינות', icon: <FileText size={18} />, path: 'exams' }
    ]
  },
  {
    name: 'כרטיסיות וחזרה',
    items: [
      { label: 'כרטיסיות חכמות', icon: <Layers size={18} />, path: 'cards' },
      { label: 'מאגר טעויות', icon: <AlertTriangle size={18} />, path: 'errors' },
      { label: 'יום לפני הבחינה', icon: <CheckSquare size={18} />, path: 'review' },
      { label: 'שמור לחזרה', icon: <Bookmark size={18} />, path: 'bookmarks' }
    ]
  },
  {
    name: 'אישי וניהול',
    items: [
      { label: 'ההתקדמות שלי', icon: <BarChart2 size={18} />, path: 'progress' },
      { label: 'סטודיו המאסטר', icon: <Sparkles size={18} />, path: 'courses' },
      { label: 'מדריך ועזרה', icon: <HelpCircle size={18} />, path: 'help' },
      { label: 'הגדרות וגיבוי', icon: <Settings size={18} />, path: 'settings' }
    ]
  }
];

export function Sidebar({ currentRoute, isMobileOpen, setMobileOpen, isCollapsed, setCollapsed, store }) {
  const { activeCourse } = useCourse();
  const courseInfo = activeCourse?.courseData?.COURSE || {};

  const isSelectingCourse = currentRoute === 'courses' || currentRoute === 'studio' || currentRoute.startsWith('studio/edit/');

  const isCurrent = (path) => {
    if (currentRoute === path) return true;
    if (path === 'chapters' && currentRoute.startsWith('chapter/')) return true;
    if (path === 'practice' && currentRoute.startsWith('question/')) return true;
    if (path === 'simulations' && currentRoute.startsWith('sim/')) return true;
    if (path === 'courses' && currentRoute.startsWith('studio')) return true;
    return false;
  };

  const syncText = store.sync || 'נשמר במכשיר הזה';

  return (
    <aside
      id="course-navigation"
      className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      aria-label="ניווט ראשי"
    >
      <div
        className="brand"
        onClick={() => navigate('courses')}
        style={{ cursor: 'pointer' }}
        title={isSelectingCourse ? 'סטודיו המאסטר' : 'חזרה לדשבורד בחירת קורס'}
      >
        <div className="brand-mark">
          <span />
          <span />
          <span />
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {isSelectingCourse ? (
            <>
              <strong>CourseForge Studio</strong>
              <small>מרכז ניהול ובחירת קורסים</small>
            </>
          ) : (
            <>
              <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {courseInfo.name || 'מערכת הלמידה'}
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
                <small style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {courseInfo.code ? `קוד ${courseInfo.code}` : 'פעיל'}
                </small>
                <button
                  className="ghost-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('courses');
                  }}
                  title="בחר קורס אחר"
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ArrowLeftRight size={11} />
                  <span>החלף</span>
                </button>
              </div>
            </>
          )}
        </div>
        <button
          className="close-drawer"
          aria-label="סגור תפריט"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(false);
          }}
        >
          <X size={20} />
        </button>
      </div>

      <nav aria-label="תפריט הקורס">
        {isSelectingCourse ? (
          /* Selection Mode: Course Content is Locked until a Course is Picked */
          <div style={{ padding: '8px 0' }}>
            <div className="nav-group">
              <p>קטלוג מרכזי</p>
              <button
                className={currentRoute === 'courses' ? 'active' : ''}
                onClick={() => {
                  navigate('courses');
                  setMobileOpen(false);
                }}
              >
                <Sparkles size={18} />
                <span>דשבורד כל הקורסים</span>
              </button>
              <button
                className={currentRoute === 'settings' ? 'active' : ''}
                onClick={() => {
                  navigate('settings');
                  setMobileOpen(false);
                }}
              >
                <Settings size={18} />
                <span>הגדרות וגיבוי</span>
              </button>
            </div>

            <div
              style={{
                margin: '22px 14px',
                padding: '18px 14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-elevated)',
                border: '1px dashed var(--border)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <Lock size={18} />
              </div>
              <b style={{ display: 'block', fontSize: '0.92rem', marginBottom: 4, color: 'var(--text-primary)' }}>
                תכני הלמידה נעולים
              </b>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                בחר קורס מהלוח כדי לפתוח את כל 22 מסכי הלמידה: פרקים, מעבדה, בנק שאלות, סימולציות וכרטיסיות.
              </p>
            </div>
          </div>
        ) : (
          /* Course Active Mode: All 20+ course learning tools are open and accessible */
          NAV_GROUPS.map(group => (
            <div key={group.name} className="nav-group">
              <p>{group.name}</p>
              {group.items.map(item => (
                <button
                  key={item.path}
                  className={isCurrent(item.path) ? 'active' : ''}
                  aria-current={isCurrent(item.path) ? 'page' : undefined}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="status-line sidebar-sync" title={syncText}>
          <span className="sync-dot connected" />
          <span>{syncText}</span>
        </div>
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
          title={isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          <span>{isCollapsed ? 'הרחב תפריט' : 'צמצם תפריט'}</span>
        </button>
      </div>
    </aside>
  );
}

