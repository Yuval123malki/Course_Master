import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, Bell } from 'lucide-react';
import { fireConfetti } from '../../utils/confetti';

export function StudyTimer({ isCompact = false }) {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    try {
      return Number(localStorage.getItem('courseforge_completed_pomodoros') || 0);
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      fireConfetti();
      try {
        // Audio beep using Web Audio API
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = mode === 'pomodoro' ? 587.33 : 440;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}

      if (mode === 'pomodoro') {
        const nextCount = completedSessions + 1;
        setCompletedSessions(nextCount);
        try {
          localStorage.setItem('courseforge_completed_pomodoros', String(nextCount));
        } catch (e) {}
        alert('🎉 כל הכבוד! סיימת 25 דקות למידה מרוכזת. קח 5 דקות הפסקה לרענון המוח.');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('☕ ההפסקה הסתיימה! מוכן לסבב למידה חדש?');
        setMode('pomodoro');
        setTimeLeft(25 * 60);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, completedSessions]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (newMode = mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  if (isCompact) {
    return (
      <div
        className="study-timer-compact"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: isRunning ? 'var(--primary-soft)' : 'var(--bg-elevated)',
          border: isRunning ? '1px solid var(--primary)' : '1px solid var(--border)',
          borderRadius: 999,
          padding: '4px 10px',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: isRunning ? 'var(--primary)' : 'var(--text-primary)' }}>
          {minutes}:{seconds}
        </span>
        <button
          type="button"
          onClick={toggleTimer}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
          title={isRunning ? 'השהה טיימר' : 'הפעל טיימר'}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
    );
  }

  return (
    <div
      className="surface study-timer-card"
      style={{
        padding: 20,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'pomodoro' ? <BookOpen size={20} style={{ color: 'var(--primary)' }} /> : <Coffee size={20} style={{ color: 'var(--green)' }} />}
          <b style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            {mode === 'pomodoro' ? 'טיימר ריכוז ולמידה (Pomodoro)' : 'זמן הפסקה והתרעננות'}
          </b>
        </div>
        <span className="pill" style={{ fontSize: '0.78rem' }}>
          הושלמו {completedSessions} סבבים
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`ghost-button ${mode === 'pomodoro' ? 'selected' : ''}`}
          onClick={() => resetTimer('pomodoro')}
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.84rem' }}
        >
          25 דקות למידה
        </button>
        <button
          className={`ghost-button ${mode === 'break' ? 'selected' : ''}`}
          onClick={() => resetTimer('break')}
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.84rem' }}
        >
          5 דקות הפסקה
        </button>
      </div>

      <div style={{ textAlign: 'center', margin: '14px 0' }}>
        <span
          style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '2px',
            color: isRunning ? 'var(--primary)' : 'var(--text-primary)'
          }}
        >
          {minutes}:{seconds}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button
          className="primary"
          onClick={toggleTimer}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 120, justifyContent: 'center' }}
        >
          {isRunning ? <Pause size={17} /> : <Play size={17} />}
          <span>{isRunning ? 'השהה' : 'התחל ריכוז'}</span>
        </button>
        <button
          className="ghost-button"
          onClick={() => resetTimer()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCcw size={16} />
          <span>איפוס</span>
        </button>
      </div>
    </div>
  );
}
