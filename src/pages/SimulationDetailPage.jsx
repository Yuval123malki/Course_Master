import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, Flag, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate, getProgressValue } from '../utils/dom';
import { fireConfetti } from '../utils/confetti';

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

export function SimulationDetailPage({ id, store }) {
  const { activeCourse } = useCourse();
  const SIMS = activeCourse?.courseData?.SIMS || [];
  const sim = SIMS.find(s => s.id === id);
  const simState = getProgressValue(store.progress, `sim:${id}`, {});

  const [state, setState] = useState(() => ({
    ...simState,
    startedAt: simState.startedAt || Date.now(),
    answers: simState.answers || {},
    flags: simState.flags || [],
    selfScores: simState.selfScores || {}
  }));

  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (state.submitted) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.submitted]);

  useEffect(() => {
    if (sim) {
      store.put(`sim:${id}`, state);
    }
  }, [state, id, sim]);

  if (!sim) {
    return <p className="surface">הסימולציה לא נמצאה.</p>;
  }

  const items = sim.items || [];
  if (items.length === 0) {
    return (
      <div className="surface empty-state">
        <h3>הסימולציה אינה מכילה שאלות כרגע.</h3>
        <button className="primary" onClick={() => navigate('simulations')}>חזרה לסימולציות</button>
      </div>
    );
  }

  const currentItem = items[activeItemIndex] || items[0];

  const totalSeconds = 10800; // 3 hours default
  const elapsed = Math.floor((now - (state.startedAt || now)) / 1000);
  const remaining = Math.max(0, totalSeconds - elapsed);
  const hours = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  const timeFormatted = `${hours}:${minutes}:${seconds}`;

  const currentAnswer = state.answers[currentItem.id] ?? '';
  const isFlagged = (state.flags || []).includes(currentItem.id);

  // Normalize choices / opts
  const getChoices = (item) => item.choices || item.opts || [];

  // Check if an MCQ answer matches the item's answer
  const isMcqCorrect = (item, answer) => {
    if (answer === undefined || answer === null || answer === '') return false;
    const choices = getChoices(item);
    let targetIndex = -1;

    if (typeof item.ans === 'number') {
      targetIndex = item.ans;
    } else if (typeof item.ans === 'string') {
      const idx = HEBREW_LETTERS.indexOf(item.ans.trim());
      if (idx !== -1) targetIndex = idx;
      else if (!isNaN(parseInt(item.ans, 10))) targetIndex = parseInt(item.ans, 10);
    }

    // Convert user answer to index
    let userIndex = -1;
    if (typeof answer === 'number') {
      userIndex = answer;
    } else if (typeof answer === 'string') {
      const idx = HEBREW_LETTERS.indexOf(answer.trim());
      if (idx !== -1) userIndex = idx;
      else if (!isNaN(parseInt(answer, 10))) userIndex = parseInt(answer, 10);
    }

    if (targetIndex !== -1 && userIndex !== -1) {
      return targetIndex === userIndex;
    }
    return String(answer).trim() === String(item.ans).trim();
  };

  const setAnswer = (val) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentItem.id]: val }
    }));
  };

  const toggleFlag = (qId) => {
    setState(prev => {
      const flags = prev.flags || [];
      const updated = flags.includes(qId) ? flags.filter(f => f !== qId) : [...flags, qId];
      return { ...prev, flags: updated };
    });
  };

  const setSelfScore = (qId, scorePercent) => {
    setState(prev => ({
      ...prev,
      selfScores: { ...prev.selfScores, [qId]: scorePercent }
    }));
  };

  const submitSim = () => {
    if (window.confirm('האם אתה בטוח שברצונך להגיש את הבחינה כעת? תוכל לעבור על הפתרונות המלאים והניקוד.')) {
      setState(prev => ({
        ...prev,
        submitted: true,
        submittedAt: Date.now()
      }));
      fireConfetti();
    }
  };

  const mcqQuestions = items.filter(i => i.part === 'mcq');
  const openQuestions = items.filter(i => i.part === 'open');
  const correctMcqCount = mcqQuestions.filter(i => isMcqCorrect(i, state.answers[i.id])).length;

  return (
    <>
      <PageHead
        eyebrow="סימולציית מבחן אקדמי"
        title={sim.title}
        desc={
          state.submitted
            ? `הבחינה הוגשה. צדקת ב-${correctMcqCount} מתוך ${mcqQuestions.length} שאלות אמריקאיות.`
            : sim.meta?.shape || 'מבחן בתנאי אמת עם שעון עצר וניקוד מפורט.'
        }
        action={
          <div className="button-row">
            <button className="ghost-button" onClick={() => navigate('simulations')}>
              חזרה לסימולציות
            </button>
            <div className="timer" aria-live="off" title="זמן שנותר">
              <Timer size={18} />
              {state.submitted ? 'הבחינה הוגשה' : timeFormatted}
            </div>
          </div>
        }
      />

      {state.submitted && (
        <section className="surface" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid var(--primary)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Award size={36} color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0 }}>סיכום תוצאות הסימולציה</h2>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                שאלות אמריקאיות: <b>{correctMcqCount} / {mcqQuestions.length}</b> ({mcqQuestions.length > 0 ? Math.round((correctMcqCount / mcqQuestions.length) * 100) : 0}%)
                {openQuestions.length > 0 && ` · ${openQuestions.length} שאלות פתוחות להערכה עצמית`}
              </p>
            </div>
            <Pill tone="priority-a">הושלם בהצלחה</Pill>
          </div>
        </section>
      )}

      <div className="exam-layout">
        <aside className="surface exam-nav" aria-label="ניווט בשאלות הסימולציה">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>שאלות ({items.length})</h2>
            <small style={{ color: 'var(--text-muted)' }}>
              {Object.keys(state.answers).length} נענו
            </small>
          </div>

          <div className="exam-nav-grid">
            {items.map((item, idx) => {
              const hasAnswer = state.answers[item.id] !== undefined && state.answers[item.id] !== '';
              const isCorrect = state.submitted && item.part === 'mcq' && isMcqCorrect(item, state.answers[item.id]);
              const isWrong = state.submitted && item.part === 'mcq' && hasAnswer && !isCorrect;
              const flagged = (state.flags || []).includes(item.id);

              let btnClass = 'exam-nav-btn';
              if (activeItemIndex === idx) btnClass += ' current';
              if (state.submitted) {
                if (item.part === 'mcq') {
                  btnClass += isCorrect ? ' answered' : isWrong ? ' incorrect' : '';
                } else if (hasAnswer) {
                  btnClass += ' answered';
                }
              } else if (hasAnswer) {
                btnClass += ' answered';
              }

              return (
                <button
                  key={item.id}
                  className={btnClass}
                  onClick={() => setActiveItemIndex(idx)}
                  style={{
                    position: 'relative',
                    borderColor: isWrong ? 'var(--danger)' : undefined,
                    background: isWrong ? 'var(--danger-subtle)' : undefined,
                    color: isWrong ? 'var(--danger)' : undefined
                  }}
                  title={`שאלה ${idx + 1} (${item.part === 'mcq' ? 'אמריקאית' : 'פתוחה'})`}
                >
                  {idx + 1}
                  {flagged && (
                    <span style={{ position: 'absolute', top: 2, left: 3, fontSize: '0.65rem', color: '#f59e0b' }}>
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="surface exam-question-view">
          <div className="practice-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill tone={currentItem.part === 'mcq' ? 'neutral' : 'priority-a'}>
                {currentItem.part === 'mcq' ? 'שאלת ברירה אמריקאית' : 'שאלה פתוחה'}
              </Pill>
              {currentItem.pts && <span>{currentItem.pts} נקודות</span>}
            </div>

            <button
              className={`ghost-button ${isFlagged ? 'selected' : ''}`}
              onClick={() => toggleFlag(currentItem.id)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <Flag size={14} fill={isFlagged ? 'currentColor' : 'none'} />
              <span>{isFlagged ? 'סומן לבדיקה' : 'סמן לבדיקה'}</span>
            </button>
          </div>

          <h2>{currentItem.title || `שאלה ${activeItemIndex + 1}`}</h2>
          <RichText html={currentItem.q} className="question-full rich" />

          {/* MCQ Options Rendering */}
          {currentItem.part === 'mcq' && getChoices(currentItem).length > 0 ? (
            <div className="exam-options">
              {getChoices(currentItem).map((choice, cIdx) => {
                const choiceLetter = HEBREW_LETTERS[cIdx] || String(cIdx + 1);
                // Check if user selected this choice
                const isSelected = currentAnswer === choiceLetter || currentAnswer === cIdx;
                // Check if this option is the officially correct one
                const isCorrectOption = state.submitted && isMcqCorrect(currentItem, cIdx);

                let optClass = 'option-btn';
                if (isSelected) optClass += ' selected';
                if (isCorrectOption) optClass += ' correct';
                if (state.submitted && isSelected && !isCorrectOption) optClass += ' incorrect';

                return (
                  <button
                    key={cIdx}
                    className={optClass}
                    onClick={() => !state.submitted && setAnswer(choiceLetter)}
                    disabled={state.submitted}
                    style={{
                      background: state.submitted && isSelected && !isCorrectOption ? 'var(--danger-subtle)' : undefined,
                      borderColor: state.submitted && isSelected && !isCorrectOption ? 'var(--danger)' : undefined
                    }}
                  >
                    <b style={{ minWidth: 28, color: 'var(--primary)' }}>{choiceLetter}.</b>
                    <div style={{ flex: 1 }}>
                      <RichText html={choice} />
                    </div>
                    {state.submitted && isCorrectOption && <CheckCircle size={18} color="var(--success)" />}
                    {state.submitted && isSelected && !isCorrectOption && <XCircle size={18} color="var(--danger)" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Open Question Textarea */
            <label className="answer-label">
              התשובה והנימוק שלך
              <textarea
                value={currentAnswer}
                onChange={e => !state.submitted && setAnswer(e.target.value)}
                disabled={state.submitted}
                rows={9}
                placeholder="רשום כאן את שלבי הפתרון, ההוכחה, האלגוריתם והחישובים..."
              />
            </label>
          )}

          {/* Solution & Rubric when Submitted */}
          {state.submitted && (
            <div className="solution" style={{ marginTop: 28 }}>
              <h2>פתרון רשמי מפורט</h2>
              <RichText html={currentItem.sol} />

              {currentItem.rubric && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <b style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>מחוון בדיקה (Rubric):</b>
                  <RichText html={currentItem.rubric} />
                </div>
              )}

              {currentItem.mistake && (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--danger-subtle)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <b style={{ color: 'var(--danger)', display: 'block', marginBottom: 4 }}>מלכודת בחינה:</b>
                  <RichText html={currentItem.mistake} />
                </div>
              )}

              {currentItem.part === 'open' && (
                <div style={{ marginTop: 18, padding: 16, borderRadius: 12, border: '1px dashed var(--border-strong)' }}>
                  <b style={{ display: 'block', marginBottom: 8 }}>הערכה עצמית לשאלה פתוחה:</b>
                  <div className="button-row">
                    <button
                      className={state.selfScores?.[currentItem.id] === 100 ? 'primary' : ''}
                      onClick={() => setSelfScore(currentItem.id, 100)}
                    >
                      פתרון מלא ונכון (100%)
                    </button>
                    <button
                      className={state.selfScores?.[currentItem.id] === 60 ? 'primary' : ''}
                      onClick={() => setSelfScore(currentItem.id, 60)}
                    >
                      כיוון נכון עם חוסרים (60%)
                    </button>
                    <button
                      className={state.selfScores?.[currentItem.id] === 0 ? 'danger-button' : ''}
                      onClick={() => setSelfScore(currentItem.id, 0)}
                    >
                      טעות עקרונית (0%)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Question Navigation Controls */}
          <div className="button-row" style={{ marginTop: 28, justifyContent: 'space-between' }}>
            <button
              disabled={activeItemIndex === 0}
              onClick={() => setActiveItemIndex(activeItemIndex - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowRight size={16} /> השאלה הקודמת
            </button>

            {!state.submitted && (
              <button className="primary" onClick={submitSim}>
                הגש בחינה וצפה בציון
              </button>
            )}

            <button
              disabled={activeItemIndex === items.length - 1}
              onClick={() => setActiveItemIndex(activeItemIndex + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              השאלה הבאה <ArrowLeft size={16} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
