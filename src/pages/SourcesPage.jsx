import React, { useState } from 'react';
import { Search, FolderArchive, FileText, Filter } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead } from '../components/common/PageHead';

export function SourcesPage() {
  const { activeCourse } = useCourse();
  const inventoryData = activeCourse?.inventoryData || [];
  const sources = activeCourse?.courseData?.SOURCES || [];

  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const items = inventoryData.length > 0
    ? inventoryData.filter(item => !['system-or-build-artifact', 'prior-generated-artifact'].includes(item.classification))
    : sources.map((s, idx) => ({ id: `src-${idx}`, filename: s, path: s, classification: 'חומר לימוד' }));

  const categories = Array.from(new Set(items.map(i => i.classification).filter(Boolean)));

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.classification !== filterType) return false;
    if (searchQuery) {
      const text = (item.filename + ' ' + (item.path || '')).toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'מקורות'}
        title="מלאי המקורות והמסמכים"
        desc={`${items.length} מסמכי מקור (מצגות, תרגולים, מטלות ומבחנים) שימשו להרכבת הקורס, שאלותיו וההמחשות.`}
      />

      <section className="surface filter-panel" style={{ padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="חפש קובץ או נתיב מקור..."
              style={{ width: '100%', paddingRight: 36 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">כל הסוגים ({items.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="question-list">
        {filteredItems.slice(0, 50).map((file, idx) => (
          <div
            key={file.id || idx}
            className="surface"
            style={{
              padding: 16,
              marginBottom: 10,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}
          >
            <FileText size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <b style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{file.filename}</b>
                <span className="pill" style={{ fontSize: '0.75rem', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
                  {file.classification || 'מסמך מקור'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right', wordBreak: 'break-all' }}>
                {file.path}
              </p>
            </div>
          </div>
        ))}
      </div>
      {filteredItems.length > 50 && (
        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          מוצגים 50 מתוך {filteredItems.length} קבצים תואמים. השתמש בחיפוש לצמצום הרשימה.
        </p>
      )}
    </>
  );
}

