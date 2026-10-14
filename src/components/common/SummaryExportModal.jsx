import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, CheckCircle2, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { useUser } from '../../context/UserContext';

export function SummaryExportModal({ close }) {
  const { activeCourse } = useCourse();
  const { currentUser } = useUser();
  const courseInfo = activeCourse?.courseData?.COURSE || {};
  const TOPICS = activeCourse?.courseData?.TOPICS || [];
  const printAreaRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={close} style={{ zIndex: 1000 }}>
      <div
        className="modal-card print-modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 900,
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl, 20px)'
        }}
      >
        {/* Modal Header (Hidden during actual print via CSS) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Printer size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>ייצוא סיכום ודף נוסחאות להדפסה / PDF</h3>
              <small style={{ color: 'var(--text-muted)' }}>
                דף סיכום מרוכז מותאם לדפי A4 להדפסה ישירה או שמירה כ-PDF
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            >
              <Printer size={16} />
              <span>הדפס / שמור כ-PDF</span>
            </button>
            <button className="icon-button" onClick={close} aria-label="סגור">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={printAreaRef}
          className="printable-sheet"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 40px',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            lineHeight: 1.6
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '2px solid var(--primary)',
              paddingBottom: 16,
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  letterSpacing: '0.05em'
                }}
              >
                {courseInfo.code ? `קורס ${courseInfo.code} · ${courseInfo.inst || ''}` : 'סיכום אקדמי מרוכז'}
              </span>
              <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 800 }}>
                {courseInfo.name || 'מבני נתונים ואלגוריתמים'} — דף נוסחאות וסיכום
              </h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                הוכן עבור: {currentUser?.name || 'סטודנט'} · יעד: {currentUser?.targetGrade || 90} ·{' '}
                {new Date().toLocaleDateString('he-IL')}
              </p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span
                className="pill priority-a"
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                CourseForge Master Edition
              </span>
            </div>
          </div>

          {/* Section 1: Data Structures Complexity Matrix */}
          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: '1.2rem',
                borderRight: '4px solid var(--primary)',
                paddingRight: 10,
                marginBottom: 12
              }}
            >
              1. טבלת סיבוכיות מבני נתונים מרכזיים
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table
                className="print-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'center',
                  background: 'var(--bg-surface)'
                }}
              >
                <thead>
                  <tr style={{ background: 'var(--primary-subtle)', color: 'var(--primary-hover)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>מבנה נתונים</th>
                    <th style={{ padding: '8px 12px' }}>גישה לפי אינדקס</th>
                    <th style={{ padding: '8px 12px' }}>חיפוש</th>
                    <th style={{ padding: '8px 12px' }}>הכנסה</th>
                    <th style={{ padding: '8px 12px' }}>מחיקה</th>
                    <th style={{ padding: '8px 12px' }}>זיכרון עזר</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>מערך רגיל (Static Array)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1)</td>
                    <td style={{ padding: '8px 12px' }}>O(n) / O(log n ממוין)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>O(n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>O(n)</td>
                    <td style={{ padding: '8px 12px' }}>O(n)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>רשימה מקושרת (Linked List)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>O(n)</td>
                    <td style={{ padding: '8px 12px' }}>O(n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) בראש/זנב</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) עם מצביע</td>
                    <td style={{ padding: '8px 12px' }}>O(n) מצביעים</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>עץ חיפוש בינארי (BST)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>—</td>
                    <td style={{ padding: '8px 12px' }}>O(h) → גרוע O(n)</td>
                    <td style={{ padding: '8px 12px' }}>O(h) → גרוע O(n)</td>
                    <td style={{ padding: '8px 12px' }}>O(h) → גרוע O(n)</td>
                    <td style={{ padding: '8px 12px' }}>O(n)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>עץ AVL (מאוזן)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>—</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(log n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(log n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(log n)</td>
                    <td style={{ padding: '8px 12px' }}>O(n) + שדות גובה</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>ערימה בינארית (Binary Heap)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) מציאת Min</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>O(n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(log n)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(log n) Extract-Min</td>
                    <td style={{ padding: '8px 12px' }}>O(n) במערך</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>טבלת גיבוב (Hash Table)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--danger)' }}>—</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) ממוצע</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) ממוצע</td>
                    <td style={{ padding: '8px 12px', color: 'var(--success)' }}>O(1) ממוצע</td>
                    <td style={{ padding: '8px 12px' }}>O(n + m)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Master Theorem & Math Formulas */}
          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: '1.2rem',
                borderRight: '4px solid var(--accent)',
                paddingRight: 10,
                marginBottom: 12
              }}
            >
              2. משפט המאסטר (Master Theorem) לנוסחאות נסיגה
            </h2>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px'
              }}
            >
              <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>
                לכל נוסחה מהצורה: <code dir="ltr" style={{ fontSize: '1rem', color: 'var(--primary)' }}>T(n) = a·T(n/b) + f(n)</code> (כאשר a ≥ 1, b &gt; 1):
              </p>
              <ul style={{ margin: 0, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <b>מקרה 1 (העלות בבסיס העץ דומיננטית):</b> אם <code dir="ltr">f(n) = O(n^(log_b(a) - ε))</code> עבור ε &gt; 0, אזי{' '}
                  <code dir="ltr" style={{ color: 'var(--primary)', fontWeight: 700 }}>T(n) = Θ(n^(log_b(a)))</code>.
                </li>
                <li>
                  <b>מקרה 2 (שוויון מאוזן בין השלבים):</b> אם <code dir="ltr">f(n) = Θ(n^(log_b(a)) · log^k(n))</code> (כאשר k ≥ 0), אזי{' '}
                  <code dir="ltr" style={{ color: 'var(--primary)', fontWeight: 700 }}>T(n) = Θ(n^(log_b(a)) · log^(k+1)(n))</code>.
                </li>
                <li>
                  <b>מקרה 3 (העלות ברמת השורש דומיננטית):</b> אם <code dir="ltr">f(n) = Ω(n^(log_b(a) + ε))</code> ומתקיים תנאי הרגולריות <code dir="ltr">a·f(n/b) ≤ c·f(n)</code> (עבור c &lt; 1), אזי{' '}
                  <code dir="ltr" style={{ color: 'var(--primary)', fontWeight: 700 }}>T(n) = Θ(f(n))</code>.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Essential Exam Traps & Pitfalls */}
          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: '1.2rem',
                borderRight: '4px solid var(--warning)',
                paddingRight: 10,
                marginBottom: 12
              }}
            >
              3. דגשים ומוקשי בחינה שכיחים (Exam Traps)
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12
              }}
            >
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>
                  <AlertTriangle size={16} />
                  <span>סיבוכיות בממוצע מול במקרה הגרוע</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  בטבלאות גיבוב ההכנסה היא O(1) רק בתוחלת. במקרה הגרוע (התנגשויות מלאות) הסיבוכיות היא O(n).
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontWeight: 600, marginBottom: 4 }}>
                  <AlertTriangle size={16} />
                  <span>בניית ערימה (Build-Heap)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  בניית ערימה שלמה מ-n איברים מתבצעת בזמן O(n) בעזרת Heapify מלמטה למעלה, ולא O(n log n).
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
                  <CheckCircle2 size={16} />
                  <span>סיבובים בעץ AVL</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  בהכנסה: לכל היותר סיבוב אחד (יחיד או כפול) מספיק להחזרת האיזון. במחיקה: ייתכנו עד O(log n) סיבובים.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Course Chapters Directory */}
          <section>
            <h2
              style={{
                fontSize: '1.2rem',
                borderRight: '4px solid var(--success)',
                paddingRight: 10,
                marginBottom: 12
              }}
            >
              4. נושאי הקורס המרכזיים ({TOPICS.length} פרקים)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {TOPICS.map((topic, i) => (
                <div
                  key={topic.id}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.86rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{i + 1}. </span>
                  <span style={{ fontWeight: 600 }}>{topic.title}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    עדיפות: {topic.prio || 'B'} · {topic.difficulty || 'בינוני'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer note */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            נוצר אוטומטית ע"י CourseForge Master Platform · בהצלחה במבחן!
          </div>
        </div>
      </div>
    </div>
  );
}
