import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, ProgressBar, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { getProgressValue } from '../utils/dom';
import { fireConfetti } from '../utils/confetti';

// Play pleasant, gentle synthesizer feedback using Web Audio API
const playTone = (type = 'flip') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'known') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'review') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.08); // D4
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

export function CardsPage({ store }) {
  const { activeCourse } = useCourse();
  const CARDS = activeCourse?.courseData?.CARDS || [];
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));

  const [topicFilter, setTopicFilter] = useState('all');
  const [onlyReview, setOnlyReview] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([...CARDS]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setShuffledCards([...CARDS]);
    setCardIndex(0);
    setIsFlipped(false);
  }, [activeCourse]);

  const filteredCards = shuffledCards.filter(c => {
    if (topicFilter !== 'all' && c.topic !== topicFilter) return false;
    if (onlyReview) {
      const status = getProgressValue(store.progress, `card:${c.id}`, '');
      if (status === 'known') return false;
    }
    return true;
  });

  const safeIndex = Math.min(cardIndex, Math.max(0, filteredCards.length - 1));
  const currentCard = filteredCards[safeIndex];

  // Leitner level (1 to 5)
  const getCardLevel = (id) => {
    const val = getProgressValue(store.progress, `card:${id}`, '0');
    if (val === 'known') return 5;
    if (val === 'review') return 1;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? 1 : Math.min(5, num);
  };

  const currentLevel = currentCard ? getCardLevel(currentCard.id) : 1;

  const knownCount = (CARDS || []).filter(
    c => getProgressValue(store.progress, `card:${c.id}`, '') === 'known'
  ).length;

  const handleFlip = () => {
    if (soundEnabled) playTone('flip');
    setIsFlipped(prev => !prev);
  };

  const handleMark = (isKnown) => {
    if (!currentCard) return;
    if (isKnown) {
      if (soundEnabled) playTone('known');
      store.put(`card:${currentCard.id}`, 'known');
      if (safeIndex === filteredCards.length - 1) {
        fireConfetti();
      } else {
        setCardIndex(safeIndex + 1);
      }
    } else {
      if (soundEnabled) playTone('review');
      store.put(`card:${currentCard.id}`, 'review');
      if (safeIndex < filteredCards.length - 1) {
        setCardIndex(safeIndex + 1);
      }
    }
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        if (safeIndex < filteredCards.length - 1) {
          setCardIndex(safeIndex + 1);
          setIsFlipped(false);
        }
      } else if (e.code === 'ArrowRight') {
        if (safeIndex > 0) {
          setCardIndex(safeIndex - 1);
          setIsFlipped(false);
        }
      } else if (e.key === '1' && currentCard) {
        handleMark(false);
      } else if (e.key === '2' && currentCard) {
        handleMark(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, filteredCards.length, currentCard, soundEnabled]);

  const handleShuffle = () => {
    const array = [...filteredCards];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    setShuffledCards(array);
    setCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', paddingBottom: 60 }}>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'כרטיסיות זיכרון'}
        title="כרטיסיות שליפה וחזרה מרווחת"
        desc="שיטת לייטנר (Leitner System): שליפה פעילה מהזיכרון. נסה להגדיר בראש, הפוך את הכרטיס ודרג את רמת השליטה."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="icon-button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'השתק אפקטים קוליים' : 'הפעל אפקטים קוליים'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem'
              }}
            >
              <CheckCircle2 size={15} color="var(--success)" />
              <span>{knownCount} / {CARDS.length} בשליטה</span>
            </div>
          </div>
        }
      />

      {/* Minimalist Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
          background: 'var(--bg-surface)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={topicFilter}
            onChange={e => {
              setTopicFilter(e.target.value);
              setCardIndex(0);
              setIsFlipped(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">כל הנושאים ({CARDS.length})</option>
            {TOPICS.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              cursor: 'pointer',
              userSelect: 'none',
              color: 'var(--text-secondary)'
            }}
          >
            <input
              type="checkbox"
              checked={onlyReview}
              onChange={e => {
                setOnlyReview(e.target.checked);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
            />
            <span>רק כרטיסיות לחזרה</span>
          </label>
        </div>

        <button
          className="ghost-button"
          onClick={handleShuffle}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '6px 12px' }}
        >
          <Shuffle size={15} />
          <span>ערבוב אקראי</span>
        </button>
      </div>

      {currentCard ? (
        <div>
          {/* Progress & Shortcuts Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              padding: '0 4px'
            }}
          >
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              כרטיס <b>{safeIndex + 1}</b> מתוך <b>{filteredCards.length}</b>
            </span>

            {/* Leitner Box Level Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title={`שלב שליטה לייטנר: ${currentLevel} מתוך 5`}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>רמת שליטה:</span>
              {[1, 2, 3, 4, 5].map(lvl => (
                <div
                  key={lvl}
                  style={{
                    width: 8,
                    height: 18,
                    borderRadius: 3,
                    background: lvl <= currentLevel ? 'var(--primary)' : 'var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* 3D Flippable Card */}
          <div
            className="flashcard-wrap"
            onClick={handleFlip}
            style={{ cursor: 'pointer', minHeight: 280 }}
          >
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front of Card */}
              <div className="flashcard-front" style={{ borderRadius: 'var(--radius-xl, 20px)' }}>
                <span className="flashcard-badge">
                  {topicsMap[currentCard.topic]?.title || currentCard.topic} · שאלה
                </span>
                <div className="flashcard-content" style={{ fontSize: '1.15rem' }}>
                  <RichText html={currentCard.q} />
                </div>
                <span className="flashcard-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={15} /> הקש רווח או לחץ להצגת התשובה
                </span>
              </div>

              {/* Back of Card */}
              <div className="flashcard-back" style={{ borderRadius: 'var(--radius-xl, 20px)' }}>
                <span className="flashcard-badge" style={{ color: 'var(--primary)' }}>
                  תשובה והסבר מלא
                </span>
                <div className="flashcard-content" style={{ fontSize: '1.05rem' }}>
                  <RichText html={currentCard.a} />
                </div>
                <span className="flashcard-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={15} /> לחץ לחזרה לשאלה
                </span>
              </div>
            </div>
          </div>

          {/* Clean Controls & Feedback Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 24,
              gap: 12
            }}
          >
            {/* Prev */}
            <button
              disabled={safeIndex === 0}
              onClick={() => {
                setCardIndex(safeIndex - 1);
                setIsFlipped(false);
              }}
              className="ghost-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 90 }}
            >
              <ArrowRight size={16} /> הקודם
            </button>

            {/* Answer Ratings */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleMark(false)}
                className="danger-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600
                }}
                title="מקש 1"
              >
                <AlertCircle size={16} />
                <span>דורש חזרה (1)</span>
              </button>

              <button
                onClick={() => handleMark(true)}
                className="primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600
                }}
                title="מקש 2"
              >
                <CheckCircle2 size={16} />
                <span>ידעתי היטב (2)</span>
              </button>
            </div>

            {/* Next */}
            <button
              disabled={safeIndex === filteredCards.length - 1}
              onClick={() => {
                setCardIndex(safeIndex + 1);
                setIsFlipped(false);
              }}
              className="ghost-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 90 }}
            >
              הבא <ArrowLeft size={16} />
            </button>
          </div>

          {/* Minimalist keyboard hints pill */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 18,
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}
          >
            קיצורי מקשים: <kbd>Space</kbd> היפוך · <kbd>1</kbd> דורש חזרה · <kbd>2</kbd> ידעתי · <kbd>→</kbd> <kbd>←</kbd> ניווט
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <Layers size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>אין כרטיסיות תואמות לסינון</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            כל הכרטיסיות נלמדו או שלא נמצאו כרטיסיות לנושא זה.
          </p>
          <button
            className="primary"
            onClick={() => { setTopicFilter('all'); setOnlyReview(false); }}
            style={{ marginTop: 16 }}
          >
            הצג את כל הכרטיסיות
          </button>
        </div>
      )}
    </div>
  );
}
