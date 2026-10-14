import React from 'react';
import { Timer, CheckCircle, ChevronLeft, Award } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { navigate, getProgressValue } from '../utils/dom';

export function SimulationsPage({ store }) {
  const { activeCourse } = useCourse();
  const SIMS = activeCourse?.courseData?.SIMS || [];

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'סימולציות'}
        title="סימולציות בחינה"
        desc={`${SIMS.length} סימולציות בחינה מלאות המשקפות את מבנה המבחן הסופי. תרגול בזמן אמת עם שעון עצר, בדיקת תשובות אמריקאיות ומחוון ניקוד עצמי.`}
      />

      <div className="chapter-grid">
        {SIMS.map(sim => {
          const simState = getProgressValue(store.progress, `sim:${sim.id}`, {});
          const isSubmitted = simState.submitted === true;
          const score = typeof simState.score === 'number' ? Math.round(simState.score) : null;

          return (
            <button
              key={sim.id}
              className="chapter-card"
              onClick={() => navigate(`sim/${sim.id}`)}
              style={{ textAlign: 'right' }}
            >
              <div className="chapter-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Timer size={22} style={{ color: 'var(--primary)' }} />
                  <Pill tone={isSubmitted ? 'success' : 'neutral'}>{sim.level || 'מבחן'}</Pill>
                </div>
                {isSubmitted && score !== null && (
                  <span
                    className="pill"
                    style={{
                      background: score >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: score >= 80 ? 'var(--green)' : 'var(--amber)',
                      fontWeight: 700
                    }}
                  >
                    ציון: {score}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.15rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{sim.title}</h2>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {(sim.items || []).length} שאלות · משך זמן: {sim.meta?.duration || '3 שעות'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: isSubmitted ? 'var(--green)' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle size={14} />
                      הוגש ונבדק
                    </>
                  ) : (
                    'טרם הוגש · לחץ להתחלה'
                  )}
                </span>
                <span className="chapter-state" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  לסימולציה <ChevronLeft size={16} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

