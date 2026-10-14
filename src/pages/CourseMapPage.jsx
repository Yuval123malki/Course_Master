import React, { useState } from 'react';
import { ChevronLeft, Info, Search, BookOpen, Layers } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead } from '../components/common/PageHead';
import { navigate } from '../utils/dom';

export function CourseMapPage() {
  const { activeCourse } = useCourse();
  const syllabusData = activeCourse?.syllabusData || {};
  const { topics = [], notInSyllabus = [] } = syllabusData;

  const [searchQuery, setSearchQuery] = useState('');

  // Fallback to courseData.TOPICS if syllabusData is not explicitly provided
  const displayTopics = topics.length > 0
    ? topics
    : (activeCourse?.courseData?.TOPICS || []).map(t => ({
        id: t.id,
        name: t.title,
        subtopics: [t.tag, ...(t.objectives || [])]
      }));

  const filteredTopics = displayTopics.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = (t.name || '').toLowerCase().includes(q);
    const matchSub = (t.subtopics || []).some(s => (s || '').toLowerCase().includes(q));
    return matchName || matchSub;
  });

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'היקף רשמי'}
        title="מפת הקורס והסילבוס"
        desc="מפת הדרכים השלמה של נושאי הקורס. לחץ על כל נושא כדי להיכנס ישירות לפרק הלימוד, הסיכום והתרגול."
      />

      <div className="filter-panel surface" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="חפש נושא או מושג בסילבוס..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingRight: 36 }}
          />
        </div>
      </div>

      <div className="map-grid">
        {filteredTopics.map((topic, idx) => (
          <button
            key={topic.id || idx}
            className="map-card"
            onClick={() => navigate(`chapter/${topic.id}`)}
            style={{ textAlign: 'right' }}
          >
            <span className="map-index">{String(idx + 1).padStart(2, '0')}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>{topic.name}</h2>
              <p>{(topic.subtopics || []).slice(0, 4).join(' · ')}</p>
              {(topic.lecture?.file || topic.syllabus?.entry) && (
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                  {topic.lecture?.file || topic.syllabus?.entry}
                </small>
              )}
            </div>
            <ChevronLeft size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {notInSyllabus.length > 0 && (
        <div
          className="notice"
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            <b>נושאים שאינם נכללים בסילבוס הפורמלי:</b> {notInSyllabus.join(' · ')}.
          </p>
        </div>
      )}
    </>
  );
}

