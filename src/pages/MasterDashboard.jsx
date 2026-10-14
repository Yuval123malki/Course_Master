import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Trash2,
  Edit3,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { CourseWizard } from '../components/studio/CourseWizard';
import { navigate } from '../utils/dom';

export function MasterDashboard() {
  const { courses, activeCourseId, selectCourse, deleteCourse } = useCourse();
  const [filterCat, setFilterCat] = useState('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const filteredCourses = courses.filter(c => filterCat === 'all' || c.category === filterCat);

  const totalTopics = courses.reduce((acc, c) => acc + (c.courseData?.TOPICS?.length || 0), 0);
  const totalQuestions = courses.reduce((acc, c) => acc + (c.courseData?.QUESTIONS?.length || 0), 0);

  const handleLaunchCourse = (id) => {
    try {
      localStorage.setItem('courseforge_has_selected', 'true');
    } catch (e) {}
    selectCourse(id);
    navigate('home');
  };

  const handleDeleteCourse = (id, title) => {
    if (courses.length <= 1) {
      alert('לא ניתן למחוק את הקורס האחרון במערכת.');
      return;
    }
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את מערכת הלמידה עבור הקורס "${title}"?`)) {
      deleteCourse(id);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="CourseForge Studio · פלטפורמת המאסטר"
        title="ניהול מערכות למידה אקדמיות"
        desc="פלטפורמה מרכזית ליצירה, ניהול והרצה של אתרי למידה שלמים לכל קורס אקדמי — מתמטיקה, מדעי המחשב, פיתוח תוכנה ועוד."
        action={
          <button
            className="primary"
            onClick={() => setIsWizardOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <PlusCircle size={18} />
            <span>צור אתר למידה לקורס חדש</span>
          </button>
        }
      />

      {/* Stats Summary Bar */}
      <div className="snapshot-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <small>קורסים מנוהלים במערכת</small>
          <strong>{courses.length}</strong>
          <span>אתרי למידה פעילים</span>
        </div>
        <div className="stat-card">
          <small>סך פרקי לימוד מקיפים</small>
          <strong>{totalTopics}</strong>
          <span>פרקים בכל התחומים</span>
        </div>
        <div className="stat-card">
          <small>שאלות בבנק עם פתרונות</small>
          <strong>{totalQuestions}</strong>
          <span>שאלות תרגול ומבחנים</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="tabs wrap">
        <button className={filterCat === 'all' ? 'selected' : ''} onClick={() => setFilterCat('all')}>
          כל הקורסים ({courses.length})
        </button>
        <button className={filterCat === 'math' ? 'selected' : ''} onClick={() => setFilterCat('math')}>
          📐 מתמטיקה ומדעים מדויקים
        </button>
        <button className={filterCat === 'cs' ? 'selected' : ''} onClick={() => setFilterCat('cs')}>
          💻 מדעי המחשב
        </button>
        <button className={filterCat === 'web' ? 'selected' : ''} onClick={() => setFilterCat('web')}>
          🌐 פיתוח תוכנה ואינטרנט
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="chapter-grid" style={{ marginTop: 16 }}>
        {filteredCourses.map(course => {
          const info = course.courseData?.COURSE || {};
          const topicsCount = course.courseData?.TOPICS?.length || 0;
          const questionsCount = course.courseData?.QUESTIONS?.length || 0;
          const examsCount = course.examsData?.exams?.length || 0;
          const isActive = course.id === activeCourseId;

          return (
            <div
              key={course.id}
              className={`surface course-card ${isActive ? 'active-course' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 24,
                borderRadius: 18,
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Pill tone={isActive ? 'priority-a' : 'neutral'}>
                    {course.categoryLabel || 'קורס אקדמי'}
                  </Pill>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {info.code || course.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)' }}>
                    {info.name || course.id}
                  </h2>
                  {isActive && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={14} /> פעיל כעת
                    </span>
                  )}
                </div>

                {info.nameEn && (
                  <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>
                    {info.nameEn}
                  </p>
                )}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                  {info.inst || 'מוסד אקדמי'} · {info.credits || '4 נ״ז'}
                </p>

                <div style={{ display: 'flex', gap: 14, fontSize: '0.86rem', color: 'var(--text-primary)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 10, marginBottom: 18 }}>
                  <span><b>{topicsCount}</b> פרקים</span>
                  <span>•</span>
                  <span><b>{questionsCount}</b> שאלות</span>
                  <span>•</span>
                  <span><b>{examsCount}</b> מבחנים</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <button
                  className="primary"
                  onClick={() => handleLaunchCourse(course.id)}
                  style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={16} />
                  <span>פתח אתר למידה</span>
                </button>

                <button
                  className="ghost-button"
                  onClick={() => navigate(`studio/edit/${course.id}`)}
                  title="ערוך תוכן הקורס בממשק CMS"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Edit3 size={15} />
                  <span>ערוך תוכן</span>
                </button>

                {courses.length > 1 && (
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteCourse(course.id, info.name)}
                    title="מחק קורס זה"
                    style={{ padding: '8px 12px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isWizardOpen && (
        <CourseWizard onClose={() => setIsWizardOpen(false)} />
      )}
    </>
  );
}
