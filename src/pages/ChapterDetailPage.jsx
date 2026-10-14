import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { LegacyStepper } from '../components/common/LegacyStepper';
import { navigate, getProgressValue } from '../utils/dom';
import { fireConfetti } from '../utils/confetti';

const TOPIC_VIZ_MAP = {
  list: ['list-ins', 'list-rev'],
  stq: ['stack-queue'],
  bt: ['traversal'],
  bst: ['bst-ins', 'bst-del'],
  avl: ['avl-ins'],
  heap: ['heap-ops', 'build-heap'],
  qs: ['partition'],
  lin: ['counting'],
  hash: ['hash'],
  aug: ['aug-size']
};

export function ChapterDetailPage({ id, store, focus, setFocus }) {
  const { activeCourse } = useCourse();
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const currentIdx = TOPICS.findIndex(t => t.id === id);
  const topic = TOPICS[currentIdx] || TOPICS.find(t => t.id === id);

  const [activeSecIndex, setActiveSecIndex] = useState(0);

  useEffect(() => {
    if (topic) {
      const prevSettings = getProgressValue(store.progress, 'settings', {});
      store.put('settings', { ...prevSettings, lastTopic: id });
    }
  }, [id, topic, store]);

  if (!topic) {
    return (
      <div className="surface empty-state">
        <h3>הפרק אינו קיים.</h3>
        <button className="primary" onClick={() => navigate('chapters')}>חזרה לרשימת הפרקים</button>
      </div>
    );
  }

  const prevTopic = currentIdx > 0 ? TOPICS[currentIdx - 1] : null;
  const nextTopic = currentIdx < TOPICS.length - 1 ? TOPICS[currentIdx + 1] : null;

  const status = getProgressValue(store.progress, `topic:${id}`, 'not-started');
  const isMastered = status === 'mastered';
  const relatedQuestions = QUESTIONS.filter(q => q.topic === id);
  const vizIds = TOPIC_VIZ_MAP[id] || [];

  const handleToggleMastered = () => {
    const nextStatus = isMastered ? 'learning' : 'mastered';
    store.put(`topic:${id}`, nextStatus);
    if (nextStatus === 'mastered') {
      fireConfetti();
    }
  };

  // Estimate reading time (~150 words per minute in Hebrew)
  const totalText = (topic.sec || []).map(s => s.html).join(' ');
  const wordsCount = totalText.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingMinutes = Math.max(3, Math.round(wordsCount / 130));

  return (
    <>
      <PageHead
        eyebrow={`פרק ${topic.n} · ${topic.tag}`}
        title={topic.title}
        desc={topic.syl}
        action={
          <div className="button-row">
            <button
              className={`ghost-button ${isMastered ? 'selected' : ''}`}
              onClick={handleToggleMastered}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: isMastered ? 'var(--success-subtle)' : undefined,
                color: isMastered ? 'var(--success)' : undefined,
                borderColor: isMastered ? 'var(--success)' : undefined
              }}
            >
              <CheckCircle size={16} />
              <span>{isMastered ? '✓ שליטה מלאה בפרק' : 'סמן כשליטה בפרק'}</span>
            </button>
            <button className="ghost-button" onClick={() => setFocus(!focus)}>
              {focus ? 'צא ממצב ריכוז' : 'מצב ריכוז'}
            </button>
          </div>
        }
      />

      <div className="chapter-layout">
        {/* Table of Contents Sticky Sidebar */}
        <aside className="chapter-toc surface" aria-label="תוכן הפרק">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <b style={{ margin: 0 }}>יחידות הלימוד</b>
            <small style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {readingMinutes} דק׳
            </small>
          </div>

          {(topic.sec || []).map((sec, idx) => (
            <button
              key={idx}
              className={activeSecIndex === idx ? 'selected' : ''}
              onClick={() => {
                setActiveSecIndex(idx);
                document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {idx + 1}. {sec.h}
            </button>
          ))}

          {vizIds.length > 0 && (
            <button
              onClick={() => {
                document.getElementById('section-viz')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 6 }}
            >
              ✦ מעבדת המחשה צעד-אחר-צעד
            </button>
          )}

          {relatedQuestions.length > 0 && (
            <button
              onClick={() => navigate(`practice?topic=${id}`)}
              style={{ color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}
            >
              ✍ תרגול {relatedQuestions.length} שאלות בפרק
            </button>
          )}
        </aside>

        {/* Main Lesson Content */}
        <div className="chapter-body">
          {topic.srcs && topic.srcs.length > 0 && (
            <div className="source-banner">
              <BookOpen size={18} />
              <span>מקורות הקורס: {topic.srcs.join(' · ')}</span>
            </div>
          )}

          {/* Theory Sections */}
          {(topic.sec || []).map((sec, idx) => (
            <section key={idx} className="surface lesson-section" id={`section-${idx}`}>
              <div className="lesson-index">
                יחידה {String(idx + 1).padStart(2, '0')} מתוך {String(topic.sec.length).padStart(2, '0')}
              </div>
              <h2>{sec.h}</h2>
              <RichText html={sec.html} />
            </section>
          ))}

          {/* Complexity / Operations Table */}
          {topic.opsTable && (
            <section className="surface lesson-section">
              <h2>טבלת פעולות וסיבוכיות</h2>
              <div className="table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      {topic.opsTable.cols.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topic.opsTable.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>
                            <RichText html={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Visual Step-by-Step Laboratory */}
          {vizIds.length > 0 && (
            <section className="surface lesson-section" id="section-viz">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="pill priority-a">מעבדה חיה</span>
                <h2 style={{ margin: 0 }}>המחשה אינטראקטיבית צעד אחר צעד</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                הרץ את האלגוריתם, צפה בשינוי המצביעים והאינווריאנטים בכל שלב:
              </p>
              {vizIds.map(vId => (
                <LegacyStepper key={vId} id={vId} />
              ))}
            </section>
          )}

          {/* Check Understanding & Practice Card */}
          <section className="surface lesson-section" style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card-subtle) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <HelpCircle size={22} color="var(--primary)" />
              <h2 style={{ margin: 0 }}>בדוק את הבנתך בפרק</h2>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              {relatedQuestions.length > 0
                ? `${relatedQuestions.length} שאלות תרגול ומבחנים זמינות בנושא זה, כולל רמזים מדורגים ופתרונות מלאים.`
                : 'תרגל שאלות מתוך בנק השאלות כדי לוודא הטמעה מלאה של החומר.'}
            </p>
            <div className="button-row" style={{ marginTop: 18 }}>
              <button
                className="primary"
                onClick={() => navigate(`practice?topic=${id}`)}
              >
                עבור לתרגול שאלות הפרק
              </button>

              <select
                aria-label="מצב שליטה בפרק"
                value={status}
                onChange={e => {
                  store.put(`topic:${id}`, e.target.value);
                  if (e.target.value === 'mastered') fireConfetti();
                }}
                style={{
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                <option value="not-started">טרם למדתי</option>
                <option value="learning">בלמידה</option>
                <option value="review">דורש חזרה</option>
                <option value="independent">תרגלתי עצמאית</option>
                <option value="mastered">✓ שולט בנושא</option>
              </select>
            </div>
          </section>

          {/* Next / Previous Chapter Navigation */}
          <div className="button-row" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', justifyContent: 'space-between' }}>
            {prevTopic ? (
              <button
                className="ghost-button"
                onClick={() => navigate(`chapter/${prevTopic.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <ArrowRight size={16} />
                <span>הפרק הקודם: {prevTopic.title}</span>
              </button>
            ) : <span />}

            {nextTopic ? (
              <button
                className="primary"
                onClick={() => navigate(`chapter/${nextTopic.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <span>הפרק הבא: {nextTopic.title}</span>
                <ArrowLeft size={16} />
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => navigate('practice')}
              >
                השלמת את כל הפרקים! עבור לתרגול
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
