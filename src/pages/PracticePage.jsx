import React, { useState } from 'react';
import { Filter, Bookmark, ChevronLeft } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate, getProgressValue } from '../utils/dom';

export function PracticePage({ store }) {
  const { activeCourse } = useCourse();
  const QUESTIONS = activeCourse?.courseData?.QUESTIONS || [];
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const topicsMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));

  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const [topicFilter, setTopicFilter] = useState(hashParams.get('topic') || 'all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = QUESTIONS.filter(q => {
    if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
    if (levelFilter !== 'all' && String(q.lvl) !== levelFilter) return false;
    if (originFilter !== 'all' && q.origin !== originFilter) return false;

    if (statusFilter === 'bookmarked') {
      const isBookmarked = getProgressValue(store.progress, `bookmark:question:${q.id}`, false);
      if (!isBookmarked) return false;
    } else if (statusFilter === 'unsolved') {
      const status = getProgressValue(store.progress, `question:${q.id}`, {}).status;
      if (status) return false;
    } else if (statusFilter === 'solved') {
      const status = getProgressValue(store.progress, `question:${q.id}`, {}).status;
      if (!status) return false;
    }

    if (searchQuery) {
      const text = [q.id, q.q, q.skill, q.type, q.src].join(' ').toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'בנק שאלות'}
        title="מאגר שאלות ותרגול"
        desc="כל שאלה מסומנת לפי מקורה. פתרונות נפתחים רק לאחר ניסיון; שאלות מדורגות עם רמזים ובדיקת טעויות."
      />

      <section className="surface filter-panel">
        <div className="filter-label">
          <Filter size={18} /> סינון שאלות <span>({filteredQuestions.length} תוצאות)</span>
        </div>

        <div className="form-row">
          <label>
            נושא
            <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
              <option value="all">כל הנושאים</option>
              {TOPICS.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </label>

          <label>
            רמת קושי
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
              <option value="all">כל הרמות</option>
              <option value="1">רמה 1 (בסיס/הגדרה)</option>
              <option value="2">רמה 2 (בינונית)</option>
              <option value="3">רמה 3 (מתקדמת/בחינה)</option>
            </select>
          </label>

          <label>
            מקור
            <select value={originFilter} onChange={e => setOriginFilter(e.target.value)}>
              <option value="all">כל המקורות</option>
              <option value="orig">שאלה ממבחן מקורי</option>
              <option value="adapt">מעובדת ממקור</option>
              <option value="new">תרגול חדש להכנה</option>
            </select>
          </label>

          <label>
            מצב פתרון
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">כל המצבים</option>
              <option value="unsolved">טרם נפתרו</option>
              <option value="solved">נפתרו</option>
              <option value="bookmarked">שמורות לחזרה</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label className="grow">
            חיפוש טקסט חופשי
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="חפש לפי מילת מפתח, מזהה או מיומנות..."
            />
          </label>
        </div>
      </section>

      <div className="question-list">
        {filteredQuestions.map(q => {
          const qStatus = getProgressValue(store.progress, `question:${q.id}`, {}).status;
          const isBookmarked = getProgressValue(store.progress, `bookmark:question:${q.id}`, false);

          return (
            <button
              key={q.id}
              className="question-row"
              onClick={() => navigate(`question/${q.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isBookmarked && <Bookmark size={18} fill="currentColor" color="var(--indigo)" />}
                <Pill tone={q.origin === 'orig' ? 'priority-a' : 'neutral'}>
                  {q.id}
                </Pill>
              </div>

              <div>
                <b>{topicsMap[q.topic]?.title || q.topic} · רמה {q.lvl}</b>
                <RichText html={q.q} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {qStatus && (
                  <span className={`pill ${qStatus === 'solved-alone' ? 'green' : qStatus === 'incorrect' ? 'red' : 'neutral'}`}>
                    {qStatus === 'solved-alone' ? 'נפתר לבד' : qStatus === 'incorrect' ? 'טעות' : 'נעזרתי'}
                  </span>
                )}
                <ChevronLeft size={18} />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
