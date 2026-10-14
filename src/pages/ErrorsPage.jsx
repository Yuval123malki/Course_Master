import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RotateCcw, Search, Trash2, ArrowLeft } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate } from '../utils/dom';

export function ErrorsPage({ store }) {
  const { activeCourse } = useCourse();
  const PITFALLS = activeCourse?.courseData?.PITFALLS || [];
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));

  const [pitfallSearch, setPitfallSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const savedErrors = Object.entries(store.progress.entries || {}).filter(
    ([k, v]) => k.startsWith('error:') && v.value && v.value.questionId
  );

  const handleResolveError = async (questionId) => {
    await store.put(`error:${questionId}`, null);
  };

  const filteredPitfalls = PITFALLS.filter(p => {
    if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false;
    if (pitfallSearch.trim()) {
      const q = pitfallSearch.toLowerCase();
      const matchTitle = (p.t || '').toLowerCase().includes(q);
      const matchWhy = (p.why || '').toLowerCase().includes(q);
      const matchRight = (p.right || '').toLowerCase().includes(q);
      return matchTitle || matchWhy || matchRight;
    }
    return true;
  });

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'מלכודות'}
        title="מאגר טעויות אישי ומלכודות בחינה"
        desc="שאלות שסימנת כטעות מופיעות כאן עם ההסבר והדרך לחזרה, לצד קטלוג המלכודות הקלאסיות של הקורס."
      />

      {savedErrors.length > 0 ? (
        <section className="surface" style={{ marginBottom: 28, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} style={{ color: 'var(--red)' }} />
              שאלות שטעית בהן בתרגול ({savedErrors.length})
            </h2>
            <small style={{ color: 'var(--text-muted)' }}>מומלץ לפתור אותן שוב ללא רמזים</small>
          </div>
          <div className="question-list">
            {savedErrors.map(([key, item]) => {
              const errorData = item.value;
              const question = QUESTIONS.find(q => q.id === errorData.questionId);

              return (
                <div
                  key={key}
                  className="surface error-card"
                  style={{
                    padding: 18,
                    marginBottom: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
                        {topicsMap[errorData.topic]?.title || errorData.topic}
                      </span>
                      <b style={{ color: 'var(--text-primary)' }}>שאלה {errorData.questionId}</b>
                    </div>
                    <button
                      className="ghost-button"
                      onClick={() => handleResolveError(errorData.questionId)}
                      title="הסר ממאגר הטעויות (סומן כהובן)"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                      הבנתי והסר
                    </button>
                  </div>

                  <div style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <RichText html={question?.q || errorData.summary || ''} />
                  </div>

                  {errorData.mistake && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        marginBottom: 14
                      }}
                    >
                      <b style={{ color: 'var(--red)', display: 'block', marginBottom: 4 }}>המלכודת / הטעות שנעשתה:</b>
                      <RichText html={errorData.mistake} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="primary"
                      onClick={() => navigate(`question/${errorData.questionId}`)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <RotateCcw size={15} />
                      נסה לפתור שוב
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div
          className="surface empty-state"
          style={{
            marginBottom: 28,
            padding: 32,
            textAlign: 'center',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 12 }}>
            <CheckCircle size={28} style={{ color: 'var(--green)' }} />
          </div>
          <h3 style={{ margin: '0 0 6px 0' }}>אין טעויות שמורות כרגע</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 460, marginInline: 'auto' }}>
            כשתתרגל שאלות ותסמן "טעיתי", השאלה תישמר כאן אוטומטית עם הסבר המלכודת כדי שתוכל לחזור עליה לפני המבחן.
          </p>
        </div>
      )}

      {PITFALLS.length > 0 && (
        <section className="surface" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>{PITFALLS.length} מלכודות וטעויות נפוצות במבחן</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="סנן מלכודות..."
                  value={pitfallSearch}
                  onChange={e => setPitfallSearch(e.target.value)}
                  style={{ paddingRight: 30, fontSize: '0.88rem', height: 36 }}
                />
              </div>
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                style={{ fontSize: '0.88rem', height: 36 }}
              >
                <option value="all">כל הנושאים</option>
                {TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pitfall-grid" style={{ marginTop: 14 }}>
            {filteredPitfalls.map((pitfall, idx) => (
              <details
                key={idx}
                className="surface"
                style={{
                  padding: 16,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-elevated)',
                  marginBottom: 10
                }}
              >
                <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--amber)' }}>⚠️</span>
                  <span>{pitfall.t}</span>
                </summary>
                <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ marginBottom: 10 }}>
                    <b style={{ color: 'var(--red)', display: 'block', marginBottom: 4 }}>למה זו טעות:</b>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <RichText html={pitfall.why} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <b style={{ color: 'var(--green)', display: 'block', marginBottom: 4 }}>הדרך הנכונה:</b>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <RichText html={pitfall.right} />
                    </div>
                  </div>
                  <small className="pill" style={{ fontSize: '0.75rem' }}>
                    נושא: {topicsMap[pitfall.topic]?.title || pitfall.topic}
                  </small>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

