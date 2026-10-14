import React from 'react';
import { Bookmark, ChevronLeft, Trash2, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate } from '../utils/dom';

export function BookmarksPage({ store }) {
  const { activeCourse } = useCourse();
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));

  const bookmarks = Object.entries(store.progress.entries || {}).filter(
    ([k, v]) => k.startsWith('bookmark:question:') && v.value === true
  );

  const handleRemoveBookmark = async (e, questionId) => {
    e.stopPropagation();
    await store.put(`bookmark:question:${questionId}`, false);
  };

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'סימניות'}
        title="שמור לחזרה"
        desc={`${bookmarks.length} שאלות שסימנת כדי לחזור אליהן לקראת הבחינה.`}
      />

      {bookmarks.length > 0 ? (
        <div className="question-list">
          {bookmarks.map(([key]) => {
            const questionId = key.replace('bookmark:question:', '');
            const question = QUESTIONS.find(q => q.id === questionId);
            if (!question) return null;

            const qData = store.progress.entries?.[`question:${questionId}`]?.value;
            const isSolved = (qData && (qData.status === 'solved-alone' || qData.status === 'solved-with-help' || qData.status === 'solved')) || store.progress.entries?.[`solve:question:${questionId}`]?.value === 'solved';

            return (
              <div
                key={key}
                className="surface question-row"
                onClick={() => navigate(`question/${questionId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, overflow: 'hidden' }}>
                  <Bookmark
                    size={22}
                    fill="var(--primary)"
                    color="var(--primary)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontSize: '0.75rem' }}>
                        {topicsMap[question.topic]?.title || question.topic}
                      </span>
                      <b style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{question.id}</b>
                      {question.skill && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          · {question.skill}
                        </span>
                      )}
                      {isSolved && (
                        <span className="pill" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--green)', fontSize: '0.75rem' }}>
                          פתור בהצלחה
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, maxHeight: '2.8em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <RichText html={question.q} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <button
                    className="ghost-button"
                    onClick={(e) => handleRemoveBookmark(e, questionId)}
                    title="הסר מהסימניות"
                    style={{ padding: 6, borderRadius: 'var(--radius-md)' }}
                  >
                    <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <ChevronLeft size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="surface empty-state"
          style={{
            padding: 36,
            textAlign: 'center',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 12 }}>
            <Bookmark size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ margin: '0 0 6px 0' }}>אין שאלות שמורות כרגע</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 460, marginInline: 'auto' }}>
            בכל שלב בתרגול תוכל ללחוץ על כפתור הסימנייה כדי לשמור שאלות מעניינות או מאתגרות לחזרה ממוקדת.
          </p>
        </div>
      )}
    </>
  );
}

