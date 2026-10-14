import React, { useState } from 'react';
import { Bookmark, CheckCircle, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate, getProgressValue } from '../utils/dom';
import { fireConfetti } from '../utils/confetti';

export function QuestionDetailPage({ id, store }) {
  const { activeCourse } = useCourse();
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const currentIdx = QUESTIONS.findIndex(q => q.id === id);
  const question = QUESTIONS[currentIdx] || QUESTIONS.find(q => q.id === id);
  const qState = getProgressValue(store.progress, `question:${id}`, {});

  const [userAnswer, setUserAnswer] = useState(qState.answer || '');
  const [hintCount, setHintCount] = useState(qState.help || 0);
  const [showSolution, setShowSolution] = useState(false);

  if (!question) {
    return (
      <div className="surface empty-state">
        <h3>השאלה לא נמצאה.</h3>
        <button className="primary" onClick={() => navigate('practice')}>חזרה לבנק השאלות</button>
      </div>
    );
  }

  const isBookmarked = getProgressValue(store.progress, `bookmark:question:${id}`, false);

  const prevQuestion = currentIdx > 0 ? QUESTIONS[currentIdx - 1] : null;
  const nextQuestion = currentIdx < QUESTIONS.length - 1 ? QUESTIONS[currentIdx + 1] : null;

  const setStatus = (status) => {
    store.put(`question:${id}`, {
      status,
      answer: userAnswer,
      help: hintCount,
      attemptedAt: Date.now()
    });
    if (status === 'solved-alone') {
      fireConfetti();
    }
  };

  const markError = () => {
    setStatus('incorrect');
    store.put(`error:${id}`, {
      questionId: id,
      topic: question.topic,
      mistake: question.mistake || 'טעות בחישוב או בהנמקה',
      answer: userAnswer,
      at: Date.now()
    });
  };

  const resetProgress = () => {
    store.put(`question:${id}`, { status: '', answer: '', help: 0 });
    setUserAnswer('');
    setHintCount(0);
    setShowSolution(false);
  };

  const steps = [
    'READ — מה הנתונים המדויקים ומה נדרש להוכיח/לחשב?',
    'IDENTIFY — איזה משפט, הגדרה או מבנה נתונים רלוונטי?',
    'TRACE — מה קורה בכל שלב או איטרציה?',
    'SOLVE — נסח הוכחה פורמלית, אלגוריתם או חישוב מפורט',
    'VERIFY — בדוק מקרי קצה (ריק, אפס, אינסוף, גבולות)'
  ];

  return (
    <>
      <PageHead
        eyebrow={`${question.id} · רמת קושי ${question.lvl} · שאלה ${currentIdx + 1} מתוך ${QUESTIONS.length}`}
        title="תרגול שאלה"
        desc="קרא, זהה את המבנה/המשפט, פתר, נמק ובדוק מול הפתרון הרשמי."
        action={
          <div className="button-row">
            <button
              className={`ghost-button ${isBookmarked ? 'selected' : ''}`}
              onClick={() => store.put(`bookmark:question:${id}`, !isBookmarked)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'נשמר לחזרה' : 'שמור לחזרה'}</span>
            </button>
            <button
              className="ghost-button"
              onClick={() => navigate('practice')}
            >
              בנק השאלות
            </button>
          </div>
        }
      />

      <div className="practice-layout">
        <section className="surface">
          <div className="practice-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill tone={question.origin === 'orig' ? 'priority-a' : 'neutral'}>
                {question.origin === 'orig'
                  ? 'שאלה ממבחן מקורי'
                  : question.origin === 'adapt'
                  ? 'מעובדת ממקור'
                  : 'תרגול הכנה'}
              </Pill>
              <span>{question.type}</span>
            </div>

            {qState.status && (
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: qState.status === 'solved-alone' ? 'var(--success)' : qState.status === 'incorrect' ? 'var(--danger)' : 'var(--primary)' }}>
                {qState.status === 'solved-alone' ? '✓ נפתר עצמאית' : qState.status === 'incorrect' ? '✗ טעות (שמור במאגר)' : '✓ נפתר עם עזרה'}
              </span>
            )}
          </div>

          <RichText html={question.q} className="question-full rich" />

          {question.src && <div className="practice-source">מקור: {question.src}</div>}

          {/* Answer Area */}
          <label className="answer-label">
            הטיוטה / הפתרון שלך
            <textarea
              value={userAnswer}
              onChange={e => {
                setUserAnswer(e.target.value);
                store.put(`question:${id}`, {
                  ...qState,
                  answer: e.target.value,
                  status: qState.status || 'draft',
                  attemptedAt: Date.now()
                });
              }}
              placeholder="כתוב כאן את שלבי הפתרון, ההוכחה, האלגוריתם או הניתוח שלך..."
              rows={8}
            />
          </label>

          {/* Solution & Hint Controls */}
          <div className="button-row" style={{ marginTop: 14 }}>
            <button
              className={showSolution ? 'primary' : 'ghost-button'}
              onClick={() => setShowSolution(!showSolution)}
            >
              {showSolution ? 'הסתר פתרון' : 'הצג פתרון רשמי'}
            </button>

            <button
              onClick={() => {
                const nextCount = hintCount + 1;
                setHintCount(nextCount);
                if (!qState.status || qState.status === 'draft') {
                  setStatus('helped');
                }
              }}
              disabled={hintCount >= (question.hints || []).length}
            >
              רמז נוסף ({hintCount}/{(question.hints || []).length})
            </button>

            {qState.status && (
              <button
                className="ghost-button"
                onClick={resetProgress}
                title="אפס את מצב התרגול לשאלה זו"
                style={{ marginRight: 'auto', fontSize: '0.82rem' }}
              >
                <RotateCcw size={14} /> אפס שאלה
              </button>
            )}
          </div>

          {/* Reveal Hints */}
          {Array.from({ length: hintCount }, (_, idx) => (
            <div key={idx} className="hint">
              <b>רמז {idx + 1}</b>
              <RichText html={question.hints[idx]} />
            </div>
          ))}

          {/* Full Solution */}
          {showSolution && (
            <div className="solution">
              <h2>פתרון והסבר מלא</h2>
              <RichText html={question.sol} />

              {question.check && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ color: 'var(--success)' }}>איך בודקים מקרי קצה?</h3>
                  <RichText html={question.check} />
                </div>
              )}

              {question.mistake && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ color: 'var(--danger)' }}>טעות נפוצה ומלכודת בבחינה:</h3>
                  <RichText html={question.mistake} />
                </div>
              )}

              {question.rubric && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ color: 'var(--primary)' }}>מחוון בדיקה (חלוקת נקודות):</h3>
                  <RichText html={question.rubric} />
                </div>
              )}

              <div className="feedback-choice">
                <span>איך הלך?</span>
                <button className={qState.status === 'solved-alone' ? 'primary' : ''} onClick={() => setStatus('solved-alone')}>
                  פתרתי לבד ✓
                </button>
                <button className={qState.status === 'solved-with-help' ? 'primary' : ''} onClick={() => setStatus('solved-with-help')}>
                  פתרתי עם עזרה
                </button>
                <button className={qState.status === 'incorrect' ? 'danger-button' : ''} onClick={markError}>
                  טעיתי — שמור למאגר
                </button>
              </div>
            </div>
          )}

          {/* Bottom Next/Prev Question Bar */}
          <div className="button-row" style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--border-subtle)', justifyContent: 'space-between' }}>
            {prevQuestion ? (
              <button
                className="ghost-button"
                onClick={() => navigate(`question/${prevQuestion.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowRight size={16} /> השאלה הקודמת ({prevQuestion.id})
              </button>
            ) : <span />}

            {nextQuestion ? (
              <button
                className="primary"
                onClick={() => navigate(`question/${nextQuestion.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                השאלה הבאה ({nextQuestion.id}) <ArrowLeft size={16} />
              </button>
            ) : <span />}
          </div>
        </section>

        {/* Sidebar Method Guide */}
        <aside className="surface practice-side" aria-label="שיטת פתרון לבחינה">
          <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>שיטת פתרון לבחינה</h2>
          {steps.map((step, idx) => (
            <div key={idx} className="method-step">
              <span className="step-num">{idx + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
