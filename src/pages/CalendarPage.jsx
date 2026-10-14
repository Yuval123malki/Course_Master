import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Sparkles,
  Flame,
  Award,
  ChevronLeft,
  ArrowLeft,
  AlertCircle,
  Layers,
  BookOpen,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { useUser } from '../context/UserContext';
import { PageHead, Pill } from '../components/common/PageHead';
import { navigate, getProgressValue } from '../utils/dom';

export function CalendarPage({ store }) {
  const { activeCourse } = useCourse();
  const { currentUser, updateUser } = useUser();
  const courseInfo = activeCourse?.courseData?.COURSE || {};

  // Store exam date in user progress or default to 21 days from now
  const savedExamDate = getProgressValue(store.progress, 'calendar:examDate', '');
  const [examDateStr, setExamDateStr] = useState(() => {
    if (savedExamDate) return savedExamDate;
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 21);
    return defaultDate.toISOString().split('T')[0];
  });

  const [moedType, setMoedType] = useState(() => {
    return getProgressValue(store.progress, 'calendar:moed', 'א');
  });

  // Calculate countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const examTime = new Date(`${examDateStr}T09:00:00`).getTime();
      const now = Date.now();
      const diff = examTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [examDateStr]);

  const handleDateChange = (newDate) => {
    setExamDateStr(newDate);
    store.put('calendar:examDate', newDate);
  };

  const handleMoedChange = (m) => {
    setMoedType(m);
    store.put('calendar:moed', m);
  };

  // Daily study checklist items
  const dailyTasks = [
    { id: 'task-solve', label: 'פתרון 3 שאלות בחינה אמיתיות', path: 'practice', icon: <HelpCircle size={16} /> },
    { id: 'task-cards', label: 'חזרה מרווחת על 15 כרטיסיות זיכרון', path: 'cards', icon: <Layers size={16} /> },
    { id: 'task-chapter', label: 'קריאת פרק תיאוריה או מעבדה אינטראקטיבית', path: 'chapters', icon: <BookOpen size={16} /> },
    { id: 'task-errors', label: 'מעבר על מאגר הטעויות והבנת הסיבה לשגיאה', path: 'errors', icon: <AlertCircle size={16} /> }
  ];

  const milestones = [
    {
      daysOut: 'שבועיים לפני',
      title: 'סיום לימוד התיאוריה ומעבר על כל הפרקים',
      desc: 'הכרת כל המבנים, נוסחאות הנסיגה ואינווריאנטים במעבדה.',
      status: timeLeft.days <= 14 ? 'done' : 'upcoming'
    },
    {
      daysOut: 'שבוע לפני',
      title: 'מרתון פתרון שאלות מבחן עצמאי',
      desc: 'פתרון לפחות 25 שאלות מכל הנושאים, ללא עזרה ברמזים.',
      status: timeLeft.days <= 7 ? 'active' : 'upcoming'
    },
    {
      daysOut: '3 ימים לפני',
      title: 'סימולציות מבחן שלמות בזמן אמת',
      desc: 'ביצוע 2 סימולציות עם שעון עצר של 3 שעות ובדיקת פתרונות.',
      status: timeLeft.days <= 3 ? 'active' : 'upcoming'
    },
    {
      daysOut: 'יום לפני הבחינה',
      title: 'חזרה קלה, דף נוסחאות ומנוחה מנטלית',
      desc: 'מעבר מרוכז על דף הנוסחאות, הכרת הפינות של החומר ושינה טובה.',
      status: timeLeft.days <= 1 ? 'active' : 'upcoming'
    }
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      <PageHead
        eyebrow="ניהול זמן ולוח זמנים לבחינה"
        title="יומן מבחנים ויעדי למידה"
        desc="תכנון מובנה ואלגנטי לקראת יום הבחינה: ספירה לאחור, אבני דרך מדורגות ומשימות יומיות ממוקדות."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="pill priority-a"
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              יעד: {currentUser?.targetGrade || 90}
            </span>
          </div>
        }
      />

      {/* Minimalist Countdown Card */}
      <section
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24
          }}
        >
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              הספירה לאחור לבחינה
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.45rem', fontWeight: 800 }}>
              {courseInfo.name || 'מבני נתונים'} — מועד {moedType}
            </h2>
          </div>

          {/* Quick Date Config */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', background: 'var(--bg-page)', padding: 3, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              {['א', 'ב', 'מיוחד'].map(m => (
                <button
                  key={m}
                  onClick={() => handleMoedChange(m)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: 'none',
                    background: moedType === m ? 'var(--primary)' : 'transparent',
                    color: moedType === m ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  מועד {m}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={examDateStr}
              onChange={e => handleDateChange(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* 4 Digital Metric Blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            textAlign: 'center'
          }}
        >
          {[
            { val: timeLeft.days, label: 'ימים' },
            { val: timeLeft.hours, label: 'שעות' },
            { val: timeLeft.minutes, label: 'דקות' },
            { val: timeLeft.seconds, label: 'שניות' }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '16px 10px'
              }}
            >
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  lineHeight: 1,
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '-0.02em'
                }}
              >
                {String(item.val).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Layout: Daily Checklist & Timeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}
      >
        {/* Daily Focus Checklist */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
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
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>משימות יומיות מומלצות</h3>
              <small style={{ color: 'var(--text-muted)' }}>שמירה על רצף למידה יומי</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dailyTasks.map(task => {
              const key = `dailyCheck:${examDateStr}:${task.id}`;
              const isChecked = getProgressValue(store.progress, key, false);

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'var(--success-subtle)' : 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => store.put(key, !isChecked)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isChecked ? (
                      <CheckCircle2 size={20} color="var(--success)" />
                    ) : (
                      <Circle size={20} color="var(--text-muted)" />
                    )}
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: isChecked ? 600 : 500,
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}
                    >
                      {task.label}
                    </span>
                  </div>

                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(task.path);
                    }}
                    title="פתח דף"
                    style={{ padding: 6 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Timeline */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
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
              <Target size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>אבני דרך עד לבחינה</h3>
              <small style={{ color: 'var(--text-muted)' }}>תוכנית עבודה מבוססת מחקר</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {milestones.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    minWidth: 70,
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-page)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textAlign: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {m.daysOut}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: '0.92rem', fontWeight: 600 }}>{m.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
