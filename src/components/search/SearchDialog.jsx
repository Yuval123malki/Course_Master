import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, BookOpen, HelpCircle, Layers, AlertTriangle, FlaskConical, Calculator, FileText } from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { Pill } from '../common/PageHead';
import { navigate } from '../../utils/dom';

export function SearchDialog({ close }) {
  const { activeCourse } = useCourse();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  const courseData = activeCourse?.courseData || {};
  const topics = courseData.TOPICS || [];
  const questions = courseData.QUESTIONS || [];
  const cards = courseData.CARDS || [];
  const pitfalls = courseData.PITFALLS || [];
  const formulas = courseData.FORMULAS || [];
  const exams = activeCourse?.examsData?.exams || [];
  const topicsMap = Object.fromEntries(topics.map(t => [t.id, t]));

  // Index everything across the active course
  const allItems = [
    ...topics.map(t => ({
      label: t.title,
      sub: t.tag || 'פרק לימוד',
      kind: 'פרק',
      icon: <BookOpen size={16} color="var(--primary)" />,
      path: 'chapter/' + t.id,
      search: `${t.title} ${t.tag} ${t.syl || ''}`
    })),
    ...questions.map(q => ({
      label: `${q.id} · ${topicsMap[q.topic]?.title || q.topic}`,
      sub: q.skill || q.type || 'שאלה ותרגול',
      kind: 'שאלה',
      icon: <HelpCircle size={16} color="var(--accent)" />,
      path: 'question/' + q.id,
      search: `${q.id} ${q.q} ${q.skill || ''} ${q.sol || ''}`
    })),
    ...cards.map(c => ({
      label: c.q,
      sub: topicsMap[c.topic]?.title || c.topic,
      kind: 'כרטיסייה',
      icon: <Layers size={16} color="#f59e0b" />,
      path: 'cards',
      search: `${c.q} ${c.a}`
    })),
    ...pitfalls.map(p => ({
      label: p.t || p.title || 'מלכודת בחינה',
      sub: p.why || 'זהירות בבחינה',
      kind: 'מוקש',
      icon: <AlertTriangle size={16} color="var(--danger)" />,
      path: 'errors',
      search: `${p.t} ${p.why} ${p.right}`
    })),
    ...exams.map(e => ({
      label: e.name,
      sub: `שנה: ${e.year || '2025'} · ${e.term || 'א׳'}`,
      kind: 'מבחן',
      icon: <FileText size={16} color="var(--cyan)" />,
      path: 'exams',
      search: `${e.name} ${e.year || ''}`
    })),
    {
      label: 'מעבדת המחשות ואלגוריתמים',
      sub: '13 הדמיות של מבני נתונים ואלגוריתמים',
      kind: 'מעבדה',
      icon: <FlaskConical size={16} color="var(--cyan)" />,
      path: 'lab',
      search: 'מעבדה המחשה הדמיה עץ רשימה ערימה מיונים גיבוב'
    },
    {
      label: 'טבלת סיבוכיות וקצבי גידול Big-O',
      sub: 'השוואת זמנים, מקום ומחשבון גידול',
      kind: 'סיבוכיות',
      icon: <Calculator size={16} color="var(--success)" />,
      path: 'complexity',
      search: 'סיבוכיות נוסחאות Big-O זמן ריצה מקום'
    }
  ];

  const results = query.trim().length > 1
    ? allItems.filter(item => item.search.toLowerCase().includes(query.toLowerCase())).slice(0, 16)
    : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].path);
          close();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, results, selectedIndex]);

  return (
    <div className="search-overlay" onClick={close}>
      <div
        ref={dialogRef}
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="חיפוש מהיר בכל הקורס"
        onClick={e => e.stopPropagation()}
      >
        <div className="search-input">
          <Search size={20} color="var(--primary)" />
          <input
            ref={inputRef}
            aria-label="חיפוש בקורס"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`חפש ב${courseData.COURSE?.name || 'קורס'} (פרקים, שאלות, מבחנים, כרטיסיות, מוקשים)...`}
          />
          <button onClick={close} aria-label="סגור">
            <X size={18} />
          </button>
        </div>

        <div className="search-results">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => {
                    navigate(item.path);
                    close();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    borderRight: isSelected ? '3px solid var(--primary)' : '3px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.icon}
                    <Pill tone={item.kind === 'פרק' ? 'priority-a' : 'neutral'}>
                      {item.kind}
                    </Pill>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    {item.sub && (
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {item.sub}
                      </small>
                    )}
                  </div>
                  <ChevronLeft size={16} color="var(--text-dim)" />
                </button>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              {query.length > 1
                ? 'לא נמצאו תוצאות תואמות לחיפוש שלך.'
                : 'הקלד לפחות 2 אותיות לחיפוש מיידי בכל הקורס (השתמש בחיצים ו-Enter לבחירה)'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
