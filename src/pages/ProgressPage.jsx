import React from 'react';
import { Award, CheckCircle, HelpCircle, AlertTriangle, Timer, Layers, ArrowLeft } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, ProgressBar, Pill } from '../components/common/PageHead';
import { getProgressValue, navigate } from '../utils/dom';

export function ProgressPage({ store }) {
  const { activeCourse } = useCourse();
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const SIMS = activeCourse?.courseData?.SIMS || [];
  const CARDS = activeCourse?.courseData?.CARDS || [];

  const masteredTopics = TOPICS.filter(
    t => getProgressValue(store.progress, `topic:${t.id}`, '') === 'mastered'
  ).length;

  const attemptedQuestions = QUESTIONS.filter(
    q => getProgressValue(store.progress, `question:${q.id}`, {}).status
  );

  const solvedAlone = attemptedQuestions.filter(
    q => getProgressValue(store.progress, `question:${q.id}`, {}).status === 'solved-alone'
  ).length;

  const solvedWithHelp = attemptedQuestions.filter(
    q => getProgressValue(store.progress, `question:${q.id}`, {}).status === 'solved-with-help'
  ).length;

  const mistakes = attemptedQuestions.filter(
    q => getProgressValue(store.progress, `question:${q.id}`, {}).status === 'incorrect'
  ).length;

  const completedSims = SIMS.filter(
    s => getProgressValue(store.progress, `sim:${s.id}`, {}).submitted
  ).length;

  const knownCards = CARDS.filter(
    c => getProgressValue(store.progress, `card:${c.id}`, '') === 'known'
  ).length;

  const topicWeaknesses = TOPICS.map(t => ({
    topic: t,
    wrong: QUESTIONS.filter(
      q => q.topic === t.id && getProgressValue(store.progress, `question:${q.id}`, {}).status === 'incorrect'
    ).length
  })).filter(item => item.wrong > 0).sort((a, b) => b.wrong - a.wrong);

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'התקדמות אישית'}
        title="לוח ההתקדמות והשליטה שלך"
        desc="כל הנתונים מחושבים מתוך הפעולות והתרגול שביצעת בפועל במערכת עבור קורס זה."
      />

      <div className="snapshot-grid">
        <div className="stat-card">
          <small>פרקים שסומנו בשליטה</small>
          <strong dir="ltr">{masteredTopics} / {TOPICS.length}</strong>
          <ProgressBar done={masteredTopics} total={TOPICS.length} />
          <span style={{ marginTop: 4 }}>{TOPICS.length > 0 ? Math.round((masteredTopics / TOPICS.length) * 100) : 0}% מהקורס הושלם</span>
        </div>

        <div className="stat-card">
          <small>פתרתי עצמאית</small>
          <strong style={{ color: 'var(--success)' }}>{solvedAlone}</strong>
          <span>שאלות ללא רמזים</span>
        </div>

        <div className="stat-card">
          <small>פתרתי עם עזרה / רמז</small>
          <strong style={{ color: 'var(--primary)' }}>{solvedWithHelp}</strong>
          <span>שאלות בתרגול מודרך</span>
        </div>

        <div className="stat-card">
          <small>טעויות לחיזוק</small>
          <strong style={{ color: 'var(--danger)' }}>{mistakes}</strong>
          <button className="text-link" onClick={() => navigate('errors')} style={{ marginTop: 4 }}>
            צפה במאגר הטעויות
          </button>
        </div>

        <div className="stat-card">
          <small>סימולציות מבחן שהוגשו</small>
          <strong dir="ltr">{completedSims} / {SIMS.length}</strong>
          <button className="text-link" onClick={() => navigate('simulations')} style={{ marginTop: 4 }}>
            מעבר לסימולציות
          </button>
        </div>

        <div className="stat-card">
          <small>כרטיסיות זיכרון שנלמדו</small>
          <strong dir="ltr">{knownCards} / {CARDS.length}</strong>
          <button className="text-link" onClick={() => navigate('cards')} style={{ marginTop: 4 }}>
            אימון כרטיסיות
          </button>
        </div>
      </div>

      {/* Topics Master Status Overview */}
      <section className="surface" style={{ marginTop: 28 }}>
        <h2>סטטוס שליטה בכל פרקי הקורס</h2>
        <div className="question-list" style={{ marginTop: 14 }}>
          {TOPICS.map(topic => {
            const status = getProgressValue(store.progress, `topic:${topic.id}`, 'not-started');
            const questionsInTopic = QUESTIONS.filter(q => q.topic === topic.id);
            const solvedInTopic = questionsInTopic.filter(
              q => getProgressValue(store.progress, `question:${q.id}`, {}).status
            ).length;

            return (
              <div
                key={topic.id}
                className="surface"
                style={{
                  padding: 16,
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="chapter-number" style={{ width: 34, height: 34, fontSize: '0.88rem' }}>
                    {topic.n}
                  </span>
                  <div>
                    <b style={{ color: 'var(--text-primary)', display: 'block' }}>{topic.title}</b>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {solvedInTopic} מתוך {questionsInTopic.length} שאלות נפתרו
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    value={status}
                    onChange={e => store.put(`topic:${topic.id}`, e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <option value="not-started">טרם למדתי</option>
                    <option value="learning">בלמידה</option>
                    <option value="review">דורש חזרה</option>
                    <option value="independent">תרגלתי עצמאית</option>
                    <option value="mastered">✓ שולט בנושא</option>
                  </select>

                  <button
                    className="ghost-button"
                    onClick={() => navigate(`chapter/${topic.id}`)}
                    style={{ padding: '7px 12px', fontSize: '0.84rem' }}
                  >
                    לפרק
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weakness Areas */}
      {topicWeaknesses.length > 0 && (
        <section className="surface" style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <h2 style={{ margin: 0 }}>נושאים שדורשים תרגול נוסף (לפי טעויות שתועדו)</h2>
          </div>
          <div className="question-list">
            {topicWeaknesses.map(item => (
              <div
                key={item.topic.id}
                className="surface"
                style={{
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <b style={{ color: 'var(--text-primary)' }}>{item.topic.title}</b>
                  <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {item.topic.tag} · {item.wrong} טעויות שתועדו בתרגול
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => navigate(`practice?topic=${item.topic.id}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span>תרגל שאלות בנושא זה</span>
                  <ArrowLeft size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
