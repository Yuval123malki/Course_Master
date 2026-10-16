import React from 'react';
import {
  ChevronLeft,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Timer,
  FlaskConical,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Wand2
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { useUser } from '../context/UserContext';
import { ProgressBar, Pill } from '../components/common/PageHead';
import { navigate, getProgressValue } from '../utils/dom';

export function HomePage({ store }) {
  const { activeCourse } = useCourse();
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
    k => k.startsWith('error:') && store.progress.entries[k]?.value
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
    <div style={{ paddingBottom: 40 }}>
      {/* Clean Academic Title Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--primary)' }}>
              {courseInfo.code ? `${courseInfo.code} · ${courseInfo.inst || ''}` : 'סביבת למידה אקדמית'}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              שלום {currentUser?.name?.split(' ')[0] || 'סטודנט'}
            </span>
          </div>

          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {courseInfo.name || 'מבני נתונים ואלגוריתמים'}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="ghost-button"
            onClick={() => navigate('calendar')}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Calendar size={14} color="var(--primary)" />
            <span>{daysUntilExam} ימים לבחינה</span>
          </button>

          <span className="pill priority-a" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Award size={14} />
            <span>יעד: {currentUser?.targetGrade || 90}</span>
          </span>
        </div>
      </div>

      {/* Primary Action Card: Continue Where You Left Off */}
      <section
        className="surface"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          padding: '24px 28px',
          marginBottom: 24
        }}
      >
        <div style={{ maxWidth: '62ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Pill tone="priority-a">המשך למידה</Pill>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              פרק {currentTopic.n || 1} מתוך {TOPICS.length} · {completionPercent}% שליטה בקורס
            </span>
          </div>

          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 750 }}>
            {currentTopic.title}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
            {currentTopic.why || 'קרא את סיכום הפרק, בדוק את טבלאות הסיבוכיות ותרגל שאלות ממבחנים.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {currentTopic.id && (
            <button
              className="primary"
              onClick={() => navigate(`chapter/${currentTopic.id}`)}
              style={{ padding: '10px 20px' }}
            >
              <span>פתח פרק</span>
              <ArrowLeft size={15} />
            </button>
          )}
          <button
            className="ghost-button"
            onClick={() => navigate(`practice?topic=${currentTopic.id}`)}
          >
            <span>תרגול שאלות</span>
          </button>
        </div>
      </section>

      {/* 4 Crisp Metric Cards */}
      <div className="snapshot-grid" style={{ marginBottom: 28 }}>
        <div
          className="stat-card"
          onClick={() => navigate('chapters')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small>פרקים שנלמדו</small>
            <BookOpen size={15} color="var(--text-muted)" />
          </div>
          <strong dir="ltr">{masteredTopics} / {TOPICS.length}</strong>
          <ProgressBar done={masteredTopics} total={TOPICS.length} />
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('practice')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small>שאלות שנפתרו</small>
            <HelpCircle size={15} color="var(--text-muted)" />
          </div>
          <strong dir="ltr">{attemptedQuestions} / {QUESTIONS.length}</strong>
          <ProgressBar done={attemptedQuestions} total={QUESTIONS.length} />
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('cards')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small>כרטיסיות בשליטה</small>
            <Layers size={15} color="var(--text-muted)" />
          </div>
          <strong dir="ltr">{cardsKnown} / {CARDS.length}</strong>
          <ProgressBar done={cardsKnown} total={CARDS.length} />
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('errors')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small>טעויות לחיזוק</small>
            <AlertTriangle size={15} color={errorsCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          </div>
          <strong style={{ color: errorsCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {errorsCount}
          </strong>
          <span>{errorsCount > 0 ? 'מומלץ לתרגל שוב' : 'אין טעויות פתוחות'}</span>
        </div>
      </div>

      {/* Two-Column Clean Workspace: Syllabus & Quick Study Tools */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          alignItems: 'start'
        }}
      >
        {/* Left/Right Column 1: Syllabus Chapters Overview */}
        <section className="surface" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>סילבוס ופרקי הקורס</h2>
            <button className="text-link" onClick={() => navigate('chapters')}>
              כל הפרקים ({TOPICS.length}) <ChevronLeft size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TOPICS.slice(0, 6).map(topic => {
              const status = getProgressValue(store.progress, `topic:${topic.id}`, 'not-started');
              const isDone = status === 'mastered';
              return (
                <button
                  key={topic.id}
                  className="action-tile-clean"
                  onClick={() => navigate(`chapter/${topic.id}`)}
                  style={{ padding: '10px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: isDone ? 'var(--success-subtle)' : 'var(--bg-elevated)',
                        color: isDone ? 'var(--success)' : 'var(--text-secondary)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {isDone ? '✓' : topic.n}
                    </span>
                    <span style={{ fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topic.title}
                    </span>
                  </div>
                  <ChevronLeft size={15} color="var(--text-muted)" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Column 2: Focused Study & Exam Tools */}
        <section className="surface" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>כלי תרגול והכנה למבחן</h2>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>גישה ישירה</small>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="action-tile-clean" onClick={() => navigate('practice')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HelpCircle size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>בנק שאלות ותרגול</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    {QUESTIONS.length} שאלות ממבחנים עם רמזים ופתרון מלא
                  </small>
                </div>
              </div>
              <ChevronLeft size={15} />
            </button>

            <button className="action-tile-clean" onClick={() => navigate('simulations')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Timer size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>סימולציות מבחן בזמן אמת</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    {SIMS.length} בחינות מלאות עם שעון עצר וציון
                  </small>
                </div>
              </div>
              <ChevronLeft size={15} />
            </button>

            <button className="action-tile-clean" onClick={() => navigate('lab')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FlaskConical size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>מעבדת אלגוריתמים חיה</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    הרצה ויזואלית צעד-אחר-צעד של מבני הנתונים
                  </small>
                </div>
              </div>
              <ChevronLeft size={15} />
            </button>

            <button className="action-tile-clean" onClick={() => navigate('cards')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>כרטיסיות זיכרון ודף נוסחאות</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    {CARDS.length} כרטיסיות לייטנר ודגשים ליום לפני המבחן
                  </small>
                </div>
              </div>
              <ChevronLeft size={15} />
            </button>

            <button className="action-tile-clean" onClick={() => navigate('studypack')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wand2 size={16} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>ספר הקורס וסיכומי הרצאות</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    סיכומים מאוחדים, דגשי מרצה וייבוא תמלילים
                  </small>
                </div>
              </div>
              <ChevronLeft size={15} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
