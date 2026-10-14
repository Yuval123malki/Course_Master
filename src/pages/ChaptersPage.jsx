import React from 'react';
import { ChevronLeft, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { navigate, getProgressValue } from '../utils/dom';

export function ChaptersPage({ store }) {
  const { activeCourse } = useCourse();
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'mastered':
        return { label: '✓ שולט', color: 'var(--green)', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'learning':
        return { label: 'בלמידה', color: 'var(--primary)', bg: 'var(--primary-soft)' };
      case 'review':
        return { label: 'דורש חזרה', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'independent':
        return { label: 'תרגלתי עצמאית', color: 'var(--secondary)', bg: 'rgba(99, 102, 241, 0.15)' };
      default:
        return { label: 'טרם סומן', color: 'var(--text-muted)', bg: 'var(--bg-elevated)' };
    }
  };

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'הקורס שלך'}
        title="פרקי לימוד"
        desc="התחל מהסדר של הסילבוס, או בחר נושא שמעסיק אותך עכשיו. כל פרק כולל תיאוריה, המחשות ותרגול."
      />

      <div className="chapter-grid">
        {TOPICS.map(topic => {
          const status = getProgressValue(store.progress, `topic:${topic.id}`, 'not-started');
          const statusInfo = getStatusInfo(status);
          const qCount = QUESTIONS.filter(q => q.topic === topic.id).length;

          return (
            <button
              key={topic.id}
              className="chapter-card"
              onClick={() => navigate(`chapter/${topic.id}`)}
              style={{ textAlign: 'right' }}
            >
              <div className="chapter-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="chapter-number">{String(topic.n || '').padStart(2, '0')}</span>
                <Pill tone={topic.prio === 'A' ? 'priority-a' : 'neutral'}>
                  עדיפות {topic.prio || 'רגילה'}
                </Pill>
              </div>

              <h2 style={{ fontSize: '1.15rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{topic.title}</h2>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {topic.tag} · {topic.sec?.length || 0} יחידות {qCount > 0 && `· ${qCount} שאלות במאגר`}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <span
                  className="pill"
                  style={{
                    fontSize: '0.78rem',
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    fontWeight: 600
                  }}
                >
                  {statusInfo.label}
                </span>
                <span className="chapter-state" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  לפרק <ChevronLeft size={16} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

