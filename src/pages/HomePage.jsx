import React from 'react';
import {
  ChevronLeft,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Timer,
  Sparkles,
  FlaskConical,
  Award,
  Layers,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Printer
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { useUser } from '../context/UserContext';
import { PageHead, ProgressBar, Pill } from '../components/common/PageHead';
import { navigate, getProgressValue } from '../utils/dom';

export function HomePage({ store, openExportPdf }) {
  const { activeCourse, courses } = useCourse();
  const { currentUser } = useUser();
  const courseData = activeCourse?.courseData || {};
  const courseInfo = courseData.COURSE || {};
  const TOPICS = courseData.TOPICS || [];
  const QUESTIONS = courseData.QUESTIONS || [];
  const SIMS = courseData.SIMS || [];
  const CARDS = courseData.CARDS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));

  // Progress metrics
  const masteredTopics = TOPICS.filter(
    t => getProgressValue(store.progress, `topic:${t.id}`, '') === 'mastered'
  ).length;

  const attemptedQuestions = QUESTIONS.filter(
    q => getProgressValue(store.progress, `question:${q.id}`, {}).status
  ).length;

  const errorsCount = Object.keys(store.progress.entries || {}).filter(
    k => k.startsWith('error:')
  ).length;

  const cardsKnown = Object.keys(store.progress.entries || {}).filter(
    k => k.startsWith('card:') && store.progress.entries[k]?.value === 'known'
  ).length;

  const lastTopicId = getProgressValue(store.progress, 'settings', { lastTopic: TOPICS[0]?.id || '' }).lastTopic || TOPICS[0]?.id || '';
  const currentTopic = topicsMap[lastTopicId] || TOPICS[0] || { title: 'התחל ללמוד', why: 'בחר פרק להתחיל', id: '' };

  const completionPercent = TOPICS.length > 0 ? Math.round((masteredTopics / TOPICS.length) * 100) : 0;

  // Exam date calculation
  const savedExamDate = getProgressValue(store.progress, 'calendar:examDate', '');
  const daysUntilExam = savedExamDate
    ? Math.max(0, Math.ceil((new Date(`${savedExamDate}T09:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 21;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Clean Minimalist Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
              {courseInfo.code ? `קורס ${courseInfo.code} · ${courseInfo.inst || ''}` : 'מרכז הלמידה האקדמי'}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              שלום {currentUser?.name?.split(' ')[0] || 'סטודנט'} 👋
            </span>
          </div>

          <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {courseInfo.name || 'מבני נתונים ואלגוריתמים'}
          </h1>
        </div>

        {/* Header Right Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="ghost-button"
            onClick={() => navigate('calendar')}
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
            <Calendar size={15} color="var(--primary)" />
            <span>{daysUntilExam} ימים לבחינה</span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <Award size={15} />
            <span>יעד: {currentUser?.targetGrade || 90}</span>
          </div>
        </div>
      </div>

      {/* Main Focus Banner (Zen Card) */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card-subtle) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ maxWidth: '65ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--primary)',
                background: 'var(--primary-subtle)',
                padding: '3px 8px',
                borderRadius: 6
              }}
            >
              המשך מאיפה שהפסקת
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              שליטה כוללת בקורס: {completionPercent}%
            </span>
          </div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.45rem', fontWeight: 800 }}>
            {currentTopic.title}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {currentTopic.why || 'פתח את הפרק כדי לצפות בסיכום המקיף, דוגמאות הקוד וסיבוכיות הפעולות.'}
          </p>
        </div>

        {currentTopic.id && (
          <button
            className="primary"
            onClick={() => navigate(`chapter/${currentTopic.id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span>המשך לפרק</span>
            <ArrowLeft size={16} />
          </button>
        )}
      </section>

      {/* 4 Minimalist Metric Tiles */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('chapters')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>פרקים שנלמדו</small>
            <BookOpen size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {masteredTopics} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {TOPICS.length}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar done={masteredTopics} total={TOPICS.length} />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('practice')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>שאלות שנפתרו</small>
            <HelpCircle size={16} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {attemptedQuestions} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {QUESTIONS.length}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar done={attemptedQuestions} total={QUESTIONS.length} />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('cards')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>כרטיסיות בשליטה</small>
            <Layers size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {cardsKnown} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {CARDS.length}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar done={cardsKnown} total={CARDS.length} />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('errors')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>טעויות לחיזוק</small>
            <AlertTriangle size={16} color={errorsCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: errorsCount > 0 ? 'var(--danger)' : 'var(--text-primary)', lineHeight: 1 }}>
            {errorsCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
            {errorsCount > 0 ? 'שאלות שדורשות חידוד' : 'אין טעויות פתוחות'}
          </span>
        </div>
      </section>

      {/* 3 Focused Academic Tracks */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>מוקדי למידה מרכזיים</h2>
          <small style={{ color: 'var(--text-muted)' }}>גישה מהירה לכל כלי הפלטפורמה</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
          {/* Pillar 1: Theory & Labs */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: 22
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>למידת תיאוריה</h3>
                <small style={{ color: 'var(--text-muted)' }}>חומרי הלימוד והמעבדות</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="action-tile-clean"
                onClick={() => navigate('chapters')}
              >
                <span>פרקי לימוד מלאים ({TOPICS.length})</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('lab')}
              >
                <span>מעבדה והמחשות ויזואליות</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('complexity')}
              >
                <span>טבלאות סיבוכיות ונוסחאות</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Pillar 2: Practice & Simulations */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: 22
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>תרגול ובחינה</h3>
                <small style={{ color: 'var(--text-muted)' }}>שאלות אמיתיות והערכה</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="action-tile-clean"
                onClick={() => navigate('practice')}
              >
                <span>בנק שאלות מבחן ({QUESTIONS.length})</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('simulations')}
              >
                <span>סימולציות מבחן שלמות ({SIMS.length})</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('cards')}
              >
                <span>כרטיסיות זיכרון חכמות ({CARDS.length})</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Pillar 3: Exam Prep & Strategy */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: 22
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'var(--success-subtle)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>הכנה לבחינה</h3>
                <small style={{ color: 'var(--text-muted)' }}>אסטרטגיה וחידוד טעויות</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="action-tile-clean"
                onClick={() => navigate('calendar')}
              >
                <span>יומן מבחנים ויעדים</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('errors')}
              >
                <span>מאגר טעויות לחיזוק</span>
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-tile-clean"
                onClick={() => navigate('review')}
              >
                <span>יום לפני הבחינה (צ'ק ליסט)</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
