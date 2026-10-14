import React, { useState } from 'react';
import { Printer, Search, Star, Lightbulb, Calculator, CheckCircle2 } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate } from '../utils/dom';

export function ReviewPage() {
  const { activeCourse } = useCourse();
  const courseData = activeCourse?.courseData || {};
  const TOPICS = courseData.TOPICS || [];
  const LASTMIN = courseData.LASTMIN || [];
  const FORMULAS = courseData.FORMULAS || [];
  const FORMULA_WARN = courseData.FORMULA_WARN;
  const priorityATopics = TOPICS.filter(t => t.prio === 'A');

  const [formulaQuery, setFormulaQuery] = useState('');

  // Extract flat or grouped formula items safely
  const parsedFormulaGroups = FORMULAS.map((f, groupIdx) => {
    if (f.items && Array.isArray(f.items)) {
      return {
        title: f.g || `קבוצה ${groupIdx + 1}`,
        src: f.src || '',
        items: f.items.map(item => ({
          key: item.k || item.name || '',
          value: item.v || item.formula || '',
          note: item.n || item.note || ''
        }))
      };
    } else {
      return {
        title: f.g || f.name || 'נוסחאות עיקריות',
        src: f.src || '',
        items: [
          {
            key: f.name || f.k || '',
            value: f.formula || f.v || '',
            note: f.note || f.n || ''
          }
        ]
      };
    }
  });

  const filteredGroups = parsedFormulaGroups.map(group => {
    if (!formulaQuery.trim()) return group;
    const q = formulaQuery.toLowerCase();
    const matchingItems = group.items.filter(
      item =>
        item.key.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        group.title.toLowerCase().includes(q)
    );
    return { ...group, items: matchingItems };
  }).filter(group => group.items.length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageHead
        eyebrow={courseData.COURSE?.name || 'חזרה מרוכזת'}
        title="יום לפני הבחינה — דף מרכז"
        desc="דגשים קריטיים, מוקשי בחינה, נוסחאות מרכזיות עם KaTeX ונושאי עדיפות A לקראת יום המבחן."
        action={
          <button className="primary" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Printer size={18} />
            <span>הדפס / שמור כ-PDF</span>
          </button>
        }
      />

      {/* Priority A Topics */}
      <section className="surface" style={{ marginBottom: 26 }}>
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={20} color="var(--primary)" fill="var(--primary)" />
            <h2>נושאי עדיפות עליונה (Priority A)</h2>
          </div>
          <Pill tone="priority-a">{priorityATopics.length} נושאי חובה</Pill>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          נושאים אלו מופיעים בהסתברות הגבוהה ביותר בכל מבחן. הקפד לשלוט בהוכחות, במבנים ובזמני הריצה שלהם:
        </p>
        <div className="chapter-grid">
          {priorityATopics.map(t => (
            <button
              key={t.id}
              className="chapter-card"
              onClick={() => navigate(`chapter/${t.id}`)}
            >
              <div className="chapter-card-top">
                <span className="chapter-number">{String(t.n).padStart(2, '0')}</span>
                <Pill tone="priority-a">עדיפות {t.prio}</Pill>
              </div>
              <h3>{t.title}</h3>
              <p>{t.why}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Last Minute Pitfalls & Tips */}
      {LASTMIN.length > 0 && (
        <section className="surface" style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Lightbulb size={20} color="#f59e0b" />
            <h2>דגשים של הדקה ה-90 ומניעת טעויות נפוצות</h2>
          </div>
          <div className="chapter-grid">
            {LASTMIN.map((item, idx) => {
              const title = item.t || item.title || item.h || `דגש ${idx + 1}`;
              const desc = item.d || item.desc || item.text || item.body || '';
              return (
                <div key={idx} className="surface" style={{ padding: 20, marginBottom: 0 }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} color="var(--success)" />
                    {title}
                  </h3>
                  <RichText html={desc} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Formulas & Mathematics Sheet */}
      {FORMULAS.length > 0 && (
        <section className="surface">
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={20} color="var(--primary)" />
              <h2>נוסחאות, זהויות וסיבוכיות</h2>
            </div>
          </div>

          {FORMULA_WARN && (
            <div className="notice" style={{ marginBottom: 16 }}>
              <RichText html={FORMULA_WARN} />
            </div>
          )}

          {/* Quick Filter Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              value={formulaQuery}
              onChange={e => setFormulaQuery(e.target.value)}
              placeholder="סנן נוסחה או מושג (למשל: סכום, רקורסיה, log, עץ)..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="surface" style={{ padding: 20, marginBottom: 0, background: 'var(--bg-card-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>{group.title}</h3>
                  {group.src && <small style={{ color: 'var(--text-muted)' }}>{group.src}</small>}
                </div>

                <div className="formula-cards">
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="formula-card-item">
                      <b style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                        <RichText html={item.key} />
                      </b>
                      <div style={{ direction: 'ltr', textAlign: 'center', margin: '10px 0', fontSize: '1.05rem' }}>
                        <RichText html={item.value} />
                      </div>
                      {item.note && (
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>
                          <RichText html={item.note} />
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <p className="empty-state">לא נמצאו נוסחאות התואמות לחיפוש שלך.</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
