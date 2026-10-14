import React, { useState } from 'react';
import { Clock, TrendingUp, Calculator, Check, ArrowRight } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';

export function ComplexityPage() {
  const { activeCourse } = useCourse();
  const TBL_STRUCT = activeCourse?.courseData?.TBL_STRUCT;
  const TBL_SORT = activeCourse?.courseData?.TBL_SORT;
  const FORMULAS = activeCourse?.courseData?.FORMULAS || [];

  const [n, setN] = useState(16);
  const [calcInput, setCalcInput] = useState('3*n^2 + 5*n*log(n) + 1000');
  const [calcResult, setCalcResult] = useState('');

  const growths = [
    { name: 'O(1)', label: 'קבוע', color: '#10b981', fn: () => 1 },
    { name: 'O(log n)', label: 'לוגריתמי', color: '#06b6d4', fn: v => Math.log2(v) },
    { name: 'O(√n)', label: 'שורש n', color: '#3b82f6', fn: v => Math.sqrt(v) },
    { name: 'O(n)', label: 'ליניארי', color: '#6366f1', fn: v => v },
    { name: 'O(n log n)', label: 'לינ-לוג (Quicksort/Merge)', color: '#8b5cf6', fn: v => v * Math.log2(v) },
    { name: 'O(n²)', label: 'ריבועי', color: '#f59e0b', fn: v => v * v },
    { name: 'O(n³)', label: 'מעוקב', color: '#f97316', fn: v => v * v * v },
    { name: 'O(2ⁿ)', label: 'מעריכי (NP-Hard)', color: '#ef4444', fn: v => (v <= 25 ? Math.pow(2, v) : Infinity) }
  ];

  const maxVal = Math.max(...growths.map(g => Math.log10(1 + Math.min(1e12, g.fn(n)))));

  // Simple Big-O evaluator rule
  const handleSimplify = () => {
    const raw = calcInput.toLowerCase().replace(/\s+/g, '');
    let res = 'O(1)';
    if (raw.includes('2^n') || raw.includes('3^n') || raw.includes('!')) {
      res = 'O(2ⁿ) — גידול מעריכי / פקטוריאלי שולט';
    } else if (raw.includes('n^3') || raw.includes('n*n*n')) {
      res = 'O(n³) — איבר מעוקב שולט';
    } else if (raw.includes('n^2') || raw.includes('n*n')) {
      res = 'O(n²) — איבר ריבועי שולט';
    } else if (raw.includes('n*log') || raw.includes('nlog')) {
      res = 'O(n log n) — איבר לינ-לוגריתמי שולט';
    } else if (raw.includes('n') && !raw.includes('log(n)')) {
      res = 'O(n) — איבר ליניארי שולט';
    } else if (raw.includes('log')) {
      res = 'O(log n) — איבר לוגריתמי שולט';
    }
    setCalcResult(res);
  };

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'סיבוכיות'}
        title="טבלאות סיבוכיות ומחשבון קצבי גידול"
        desc="השוואת זמני ריצה, זיכרון עזר, התנהגות אסימפטוטית ומדרג הפונקציות הנלמדות בקורס."
      />

      {/* Interactive Growth Simulator */}
      <section className="surface">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={22} color="var(--primary)" />
            <h2>סימולטור קצבי גידול אסימפטוטיים</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem', minWidth: 60 }}>
              n = {n}
            </span>
            <input
              type="range"
              min="2"
              max="40"
              value={n}
              onChange={e => setN(Number(e.target.value))}
              style={{ width: 160, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 20 }}>
          הזז את המחוון כדי לראות כיצד מספר הפעולות הדרוש מזנק בין המחלקות השונות (הסרגל מוצג בסקאלה לוגריתמית לקריאות):
        </p>

        <div className="growth-chart" role="img" aria-label="השוואת קצבי גידול">
          {growths.map(g => {
            const rawVal = g.fn(n);
            const displayVal = rawVal === Infinity ? 'אינסוף' : Math.round(rawVal).toLocaleString();
            const percent = rawVal === Infinity ? 100 : Math.max(1, (Math.log10(1 + rawVal) / maxVal) * 100);

            return (
              <div key={g.name} className="growth-row">
                <div>
                  <b dir="ltr" style={{ color: 'var(--text-primary)', display: 'block' }}>{g.name}</b>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{g.label}</small>
                </div>
                <div className="growth-track">
                  <span style={{ width: `${percent}%`, background: g.color }} />
                </div>
                <small style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{displayVal}</small>
              </div>
            );
          })}
        </div>
      </section>

      {/* Big-O Simplifier Calculator */}
      <section className="surface" style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card-subtle) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Calculator size={20} color="var(--primary)" />
          <h2>מחשבון פישוט Big-O</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 16 }}>
          הזן פונקציית זמן ריצה (כגון <code dir="ltr">3*n^2 + 5*n*log(n) + 1000</code> או <code dir="ltr">n + 2^n</code>) כדי למצוא את החסם האסימפטוטי השולט:
        </p>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <label className="grow">
            פונקציית זמן ריצה T(n)
            <input
              value={calcInput}
              onChange={e => setCalcInput(e.target.value)}
              placeholder="לדוגמה: 5*n^2 + 20*n"
              dir="ltr"
              style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}
            />
          </label>
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="primary" onClick={handleSimplify} style={{ minHeight: 42 }}>
              חשב חסם הדוק Θ
            </button>
          </div>
        </div>

        {calcResult && (
          <div className="surface" style={{ marginTop: 14, padding: 14, background: 'var(--primary-subtle)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Check size={20} color="var(--primary)" />
            <b style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{calcResult}</b>
          </div>
        )}
      </section>

      {/* Data Structures Complexity Table */}
      {TBL_STRUCT && (
        <section className="surface">
          <h2>טבלת סיבוכיות למבני נתונים</h2>
          <div className="table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  {(TBL_STRUCT.cols || []).map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(TBL_STRUCT.rows || []).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <RichText html={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sorting Algorithms Table */}
      {TBL_SORT && (
        <section className="surface">
          <h2>טבלת אלגוריתמי מיון</h2>
          <div className="table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  {(TBL_SORT.cols || []).map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(TBL_SORT.rows || []).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <RichText html={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
