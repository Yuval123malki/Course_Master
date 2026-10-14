import React, { useState } from 'react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';

export function PatternsPage() {
  const { activeCourse } = useCourse();
  const patternsData = activeCourse?.patternsData || {};
  const examsData = activeCourse?.examsData || {};
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t.title]));

  const [tab, setTab] = useState('historical');
  const patterns = patternsData.patterns || [];
  const { frequency = [], recentFrequency = [], year2026Frequency = [] } = examsData;

  const hasRecent = Array.isArray(recentFrequency) ? recentFrequency.length > 0 : Object.keys(recentFrequency).length > 0;
  const has2026 = Array.isArray(year2026Frequency) ? year2026Frequency.length > 0 : Object.keys(year2026Frequency).length > 0;

  const currentFreq = tab === '2026' ? year2026Frequency : tab === 'recent' ? recentFrequency : frequency;

  const normalizedFreq = Array.isArray(currentFreq)
    ? currentFreq.map(item => ({
        topic: topicsMap[item.topic] || item.topic,
        count: item.examCount,
        percent: item.denominator ? Math.round((item.examCount / item.denominator) * 100) : null
      }))
    : Object.entries(currentFreq || {}).map(([topic, count]) => ({
        topic: topicsMap[topic] || topic,
        count: typeof count === 'number' ? count : (count?.examCount || count),
        percent: typeof count === 'number' ? Math.round(count * 10) : null
      }));

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'דפוסים'}
        title="דפוסי שאלות בבחינה"
        desc="דפוסים ושיטות פתרון שחושבו משאלוני הבחינה שנותחו עבור קורס זה."
      />

      <div className="tabs">
        <button
          className={tab === 'historical' ? 'selected' : ''}
          onClick={() => setTab('historical')}
        >
          דפוסי פתרון ({patterns.length})
        </button>
        {hasRecent && (
          <button
            className={tab === 'recent' ? 'selected' : ''}
            onClick={() => setTab('recent')}
          >
            סגנון המבחנים האחרונים
          </button>
        )}
        {has2026 && (
          <button
            className={tab === '2026' ? 'selected' : ''}
            onClick={() => setTab('2026')}
          >
            בחינות 2026
          </button>
        )}
      </div>

      {tab === 'historical' ? (
        <div className="pattern-grid">
          {patterns.length === 0 ? (
            <div className="surface" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              לא הוגדרו עדיין דפוסי פתרון ספציפיים עבור קורס זה.
            </div>
          ) : (
            patterns.map((pat, idx) => (
              <div key={idx} className="surface pattern-card">
                <div className="section-title">
                  <Pill tone={pat.priority === 'A' ? 'priority-a' : 'neutral'}>
                    עדיפות {pat.priority}
                  </Pill>
                  {pat.denominator && <span>{pat.examCount}/{pat.denominator} מבחנים</span>}
                </div>
                <h2>{pat.name}</h2>
                <p>{pat.method}</p>
                <details style={{ marginTop: 10 }}>
                  <summary>פירוט ודוגמאות</summary>
                  <div style={{ marginTop: 8, fontSize: '0.92rem', color: 'var(--muted)' }}>
                    {pat.where && <p><b>איפה מופיע:</b> {pat.where}</p>}
                    <p><b>איך לגשת:</b> {pat.tips}</p>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="surface">
          <h2>שכיחות נושאים ({tab === '2026' ? 'בחינות 2026' : 'מבחנים אחרונים'})</h2>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>נושא</th>
                  <th>שכיחות הופעה</th>
                  <th>אחוז מתוך המבחנים</th>
                </tr>
              </thead>
              <tbody>
                {normalizedFreq.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                      אין נתוני שכיחות זמינים לתקופה זו.
                    </td>
                  </tr>
                ) : (
                  normalizedFreq.map((item, idx) => (
                    <tr key={idx}>
                      <td><b>{item.topic}</b></td>
                      <td>{item.count} הופעות</td>
                      <td>{item.percent !== null ? `${item.percent}%` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
