import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead } from '../components/common/PageHead';
import { fireConfetti } from '../utils/confetti';
import { navigate } from '../utils/dom';

export function StudyPlanPage({ store }) {
  const { activeCourse } = useCourse();
  const plans = activeCourse?.courseData?.PLANS || [
    {
      id: 'default',
      title: 'תוכנית לימוד סדורה',
      sub: 'מעבר הדרגתי על כל נושאי הקורס ותרגול',
      days: (activeCourse?.courseData?.TOPICS || []).map((t, idx) => ({
        d: `יום ${idx + 1}`,
        learn: t.title,
        drill: `פתרון שאלות בנושא ${t.tag}`,
        note: 'חזרה על החומר ותרגול'
      }))
    }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const days = activePlan?.days || [];
  const completedCount = days.filter(day => {
    return store?.progress?.entries?.[`plan_day:${activePlan.id}:${day.d}`]?.value === true;
  }).length;

  const progressPercent = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;

  const toggleDayCompletion = async (dayKey) => {
    if (!store) return;
    const current = store.progress.entries?.[`plan_day:${activePlan.id}:${dayKey}`]?.value === true;
    await store.put(`plan_day:${activePlan.id}:${dayKey}`, !current);

    if (!current && completedCount + 1 === days.length) {
      fireConfetti();
    }
  };

  const resetPlan = async () => {
    if (!store) return;
    if (window.confirm('האם לאפס את סימוני ההשלמה בתוכנית זו?')) {
      for (const day of days) {
        await store.put(`plan_day:${activePlan.id}:${day.d}`, false);
      }
    }
  };

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'תוכנית לימוד'}
        title="תוכנית לימוד ותרגול"
        desc="תוכנית מובנית המבוססת על סדר התלות בין הנושאים ועל החומר המופיע בבחינות."
      />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {plans.map(plan => (
          <button
            key={plan.id}
            className={selectedPlanId === plan.id ? 'selected' : ''}
            onClick={() => setSelectedPlanId(plan.id)}
          >
            {plan.title}
          </button>
        ))}
      </div>

      {activePlan && (
        <div style={{ marginBottom: 24 }}>
          <div
            className="surface"
            style={{
              padding: 20,
              borderRadius: 'var(--radius-lg)',
              marginBottom: 20,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>{activePlan.title}</h3>
                <small style={{ color: 'var(--text-muted)' }}>{activePlan.sub || `${days.length} ימי למידה ממוקדים`}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: progressPercent === 100 ? 'var(--green)' : 'var(--primary)' }}>
                  {progressPercent}% הושלמו ({completedCount}/{days.length})
                </span>
                {completedCount > 0 && (
                  <button
                    className="ghost-button"
                    onClick={resetPlan}
                    title="אפס סימונים"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <RotateCcw size={14} />
                    איפוס
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: 8,
                background: 'var(--bg-page)',
                borderRadius: 999,
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: progressPercent === 100
                    ? 'linear-gradient(90deg, var(--green), #10b981)'
                    : 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: 999,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          <div className="plan-list">
            {days.map((day, idx) => {
              const isCompleted = store?.progress?.entries?.[`plan_day:${activePlan.id}:${day.d}`]?.value === true;

              return (
                <section
                  key={idx}
                  className="surface plan-day"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderRadius: 'var(--radius-lg)',
                    border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border)',
                    background: isCompleted ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-surface)',
                    transition: 'border-color 0.2s ease, background 0.2s ease'
                  }}
                >
                  <button
                    className="ghost-button"
                    onClick={() => toggleDayCompletion(day.d)}
                    title={isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                    style={{
                      padding: 4,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={26} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Circle size={26} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span
                        className="pill"
                        style={{
                          background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'var(--primary-soft)',
                          color: isCompleted ? 'var(--green)' : 'var(--primary-hover)',
                          fontWeight: 700
                        }}
                      >
                        {day.d}
                      </span>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: '1.05rem',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}
                      >
                        {day.learn}
                      </h2>
                    </div>

                    <p style={{ margin: '6px 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      <b style={{ color: 'var(--text-primary)' }}>יעד תרגול: </b>
                      {day.drill}
                    </p>

                    {day.note && (
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                        💡 {day.note}
                      </small>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

