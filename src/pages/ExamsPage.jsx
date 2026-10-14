import React, { useState } from 'react';
import { Download, FileText, Search, Award, CheckCircle, ExternalLink } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { navigate } from '../utils/dom';

export function ExamsPage() {
  const { activeCourse } = useCourse();
  const examsData = activeCourse?.examsData || {};
  const { exams = [], methodology = {} } = examsData;

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');

  const filteredExams = exams.filter(e => {
    if (selectedGroup !== 'all' && e.group !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (e.name || '').toLowerCase().includes(q);
      const matchYear = String(e.year || '').includes(q);
      const matchQuestions = (e.questions || []).some(quest => {
        const title = typeof quest === 'object' ? (quest.summary || quest.skill || quest.id) : quest;
        return (title || '').toLowerCase().includes(q);
      });
      return matchName || matchYear || matchQuestions;
    }
    return true;
  });

  const activeExam = filteredExams.find(e => e.id === selectedExamId) || filteredExams[0];

  const groups = [
    ['all', 'כל המבחנים'],
    ['main-paper', 'בחינות ראשיות'],
    ['completion-course', 'השלמות'],
    ['sample', 'מבחני דוגמה']
  ];

  const totalQuestions = exams.reduce((acc, ex) => acc + (ex.questions || []).length, 0);

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'בחינות'}
        title="ארכיון וניתוח בחינות"
        desc={`${exams.length} שאלוני בחינה ופתרונות מלאים מתועדים (${totalQuestions} שאלות מאומתות) עבור קורס זה.`}
      />

      <div className="filter-panel surface" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="חפש מבחן, שנה או מילת מפתח בשאלות..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingRight: 36 }}
            />
          </div>
          <div className="tabs wrap" style={{ margin: 0 }}>
            {groups.map(([grp, label]) => (
              <button
                key={grp}
                className={selectedGroup === grp ? 'selected' : ''}
                onClick={() => {
                  setSelectedGroup(grp);
                  setSelectedExamId('');
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="exam-index-layout">
        <div className="surface exam-list">
          {filteredExams.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              לא נמצאו מבחנים תואמים.
            </div>
          ) : (
            filteredExams.map(ex => (
              <button
                key={ex.id}
                className={activeExam?.id === ex.id ? 'selected' : ''}
                onClick={() => setSelectedExamId(ex.id)}
              >
                <span>{ex.year || '—'}</span>
                <b>{ex.name}</b>
                <small>{(ex.questions || []).length} שאלות מתועדות</small>
              </button>
            ))
          )}
        </div>

        {activeExam && (
          <section className="surface exam-detail">
            <div className="section-title">
              <div>
                <h2>{activeExam.name}</h2>
                <p>שנה: {activeExam.year || 'תשפ״ה'} · סמסטר {activeExam.term || 'א׳'} · מועד {activeExam.moed || 'א׳'}</p>
              </div>
              <Pill>{activeExam.group || 'מבחן'}</Pill>
            </div>

            {(activeExam.downloadUrl || activeExam.solutionUrl) && (
              <div
                className="download-banner"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  padding: 18,
                  borderRadius: 'var(--radius-lg)',
                  margin: '18px 0'
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>קובצי בחינה מקוריים (Word DOCX)</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  הורד את השאלון והפתרון הרשמיים לעבודה מקבילה על נייר או במעבד תמלילים:
                </p>
                <div className="button-row" style={{ marginTop: 8 }}>
                  {activeExam.downloadUrl && (
                    <a
                      href={activeExam.downloadUrl}
                      download
                      className="primary button-link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                    >
                      <Download size={16} />
                      הורד שאלון בחינה
                    </a>
                  )}
                  {activeExam.solutionUrl && (
                    <a
                      href={activeExam.solutionUrl}
                      download
                      className="ghost-button button-link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                    >
                      <Download size={16} />
                      הורד פתרון רשמי
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>שאלות הבחינה שתועדו במאגר ({(activeExam.questions || []).length}):</h3>
              <small style={{ color: 'var(--text-muted)' }}>לחץ על שאלה למעבר ישיר לפתרון מפורט</small>
            </div>

            <div className="question-list">
              {(activeExam.questions || []).map((q, qIdx) => {
                const isObj = typeof q === 'object' && q !== null;
                const qTargetId = isObj ? (q.practiceId || q.id) : q;
                const qNumber = isObj ? (q.number || `שאלה ${qIdx + 1}`) : `שאלה ${qIdx + 1}`;
                const qTitle = isObj ? (q.summary || q.skill || q.id) : q;
                const qPoints = isObj && q.points ? `${q.points} נק׳` : null;
                const qTopic = isObj && (q.primaryTopic || q.topic);
                const qType = isObj && q.type;

                return (
                  <button
                    key={qIdx}
                    className="question-row"
                    onClick={() => navigate(`question/${qTargetId}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                      <FileText size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          {qNumber}: {qTitle}
                        </span>
                        {qType && (
                          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2, display: 'block' }}>
                            {qType}
                          </small>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {qTopic && <span className="pill" style={{ fontSize: '0.75rem' }}>{qTopic}</span>}
                      {qPoints && (
                        <span
                          className="pill"
                          style={{
                            fontSize: '0.75rem',
                            background: 'var(--primary-soft)',
                            color: 'var(--primary-hover)',
                            fontWeight: 600
                          }}
                        >
                          {qPoints}
                        </span>
                      )}
                      <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

