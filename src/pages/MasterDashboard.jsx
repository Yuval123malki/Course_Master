import React, { useState } from 'react';
import {
  Trash2,
  Edit3,
  ArrowLeft,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { CourseWizard } from '../components/studio/CourseWizard';
import { navigate } from '../utils/dom';

export function MasterDashboard() {
  const { courses, activeCourseId, selectCourse, deleteCourse } = useCourse();
  const [filterCat, setFilterCat] = useState('all');
  const [isWizardOpen, setIsWizardOpen] = useState(() => window.location.hash.includes('new=1'));

  const filteredCourses = courses.filter(c => filterCat === 'all' || c.category === filterCat);

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
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקורס "${title}"?`)) {
      deleteCourse(id);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="ספריית הקורסים שלך"
        title="בחר או הוסף קורס ללמידה"
        desc="כל קורס כולל פרקי לימוד מסודרים, מעבדות אינטראקטיביות, בנק שאלות מבחן וכרטיסיות חזרה."
        action={
          <button
            className="primary"
            onClick={() => setIsWizardOpen(true)}
          >
            <PlusCircle size={16} />
            <span>הוסף קורס חדש</span>
          </button>
        }
      />

      {/* Category Filter Tabs */}
      <div className="tabs wrap">
        <button className={filterCat === 'all' ? 'selected' : ''} onClick={() => setFilterCat('all')}>
          הכל ({courses.length})
        </button>
        <button className={filterCat === 'cs' ? 'selected' : ''} onClick={() => setFilterCat('cs')}>
          מדעי המחשב
        </button>
        <button className={filterCat === 'math' ? 'selected' : ''} onClick={() => setFilterCat('math')}>
          מתמטיקה
        </button>
        <button className={filterCat === 'web' ? 'selected' : ''} onClick={() => setFilterCat('web')}>
          פיתוח תוכנה
        </button>
      </div>

      {/* Clean Course Cards Grid */}
      <div className="chapter-grid">
        {filteredCourses.map(course => {
          const info = course.courseData?.COURSE || {};
          const topicsCount = course.courseData?.TOPICS?.length || 0;
          const questionsCount = course.courseData?.QUESTIONS?.length || 0;
          const examsCount = course.examsData?.exams?.length || 0;
          const isActive = course.id === activeCourseId;

          return (
            <div
              key={course.id}
              className="surface"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 22,
                marginBottom: 0,
                border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Pill tone={isActive ? 'priority-a' : 'neutral'}>
                    {course.categoryLabel || 'קורס אקדמי'}
                  </Pill>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {info.code || course.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                    {info.name || course.id}
                  </h2>
                  {isActive && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={13} /> פעיל
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                  {info.inst || 'מוסד אקדמי'} · {info.credits || '4 נ״ז'}
                </p>

                <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg-page)', borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                  <span><b>{topicsCount}</b> פרקים</span>
                  <span>·</span>
                  <span><b>{questionsCount}</b> שאלות</span>
                  <span>·</span>
                  <span><b>{examsCount}</b> מבחנים</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  className="primary"
                  onClick={() => handleLaunchCourse(course.id)}
                  style={{ flex: 1 }}
                >
                  <span>היכנס לקורס</span>
                  <ArrowLeft size={15} />
                </button>

                <button
                  className="ghost-button"
                  onClick={() => navigate(`studio/edit/${course.id}`)}
                  title="ערוך פרקים ושאלות"
                >
                  <Edit3 size={14} />
                  <span>עריכה</span>
                </button>

                {courses.length > 1 && (
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteCourse(course.id, info.name)}
                    title="מחק קורס"
                    style={{ padding: '8px 10px' }}
                  >
                    <Trash2 size={15} />
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
