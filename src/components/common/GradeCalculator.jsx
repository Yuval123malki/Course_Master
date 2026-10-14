import React, { useState } from 'react';
import { Calculator, Award, Target, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { useUser } from '../../context/UserContext';

export function GradeCalculator() {
  const { activeCourse } = useCourse();
  const { currentUser } = useUser();
  const courseInfo = activeCourse?.courseData?.COURSE || {};

  // Default weights: Exam 80%, Assignments 10%, Quizzes/Projects 10%
  const [examWeight, setExamWeight] = useState(80);
  const [hwWeight, setHwWeight] = useState(10);
  const [quizWeight, setQuizWeight] = useState(10);

  const [hwGrade, setHwGrade] = useState(95);
  const [quizGrade, setQuizGrade] = useState(90);
  const [targetFinal, setTargetFinal] = useState(currentUser?.targetGrade || 90);
  const [hypoExamGrade, setHypoExamGrade] = useState(85);

  // Calculate required exam grade to achieve target
  // Target = (Exam * examWeight + HW * hwWeight + Quiz * quizWeight) / 100
  // Exam = (Target * 100 - HW * hwWeight - Quiz * quizWeight) / examWeight
  const otherParts = (hwGrade * hwWeight + quizGrade * quizWeight) / 100;
  const rawRequiredExam = Math.ceil((targetFinal - otherParts) / (examWeight / 100));
  const requiredExamGrade = Math.max(0, rawRequiredExam);

  // Calculate final score with hypothetical exam
  const calculatedFinal = Math.round(
    (hypoExamGrade * examWeight + hwGrade * hwWeight + quizGrade * quizWeight) / 100
  );

  const getGradeHonor = (score, exam) => {
    if (exam < 55) return { text: 'נכשל (ציון בחינה מתחת ל-55 חוסם מעבר)', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.12)' };
    if (score >= 95) return { text: 'הצטיינות יתרה / מצטיין דיקן 🏆', color: 'var(--green)', bg: 'rgba(34, 197, 94, 0.15)' };
    if (score >= 90) return { text: 'הצטיינות ראויה לשבח 🌟', color: 'var(--primary)', bg: 'var(--primary-soft)' };
    if (score >= 80) return { text: 'ציון טוב מאוד 👏', color: 'var(--secondary)', bg: 'rgba(99, 102, 241, 0.12)' };
    if (score >= 55) return { text: 'עובר בהצלחה ✓', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' };
    return { text: 'ציון נכשל ⚠️', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.12)' };
  };

  const status = getGradeHonor(calculatedFinal, hypoExamGrade);

  return (
    <div
      className="grade-calculator-card surface"
      style={{
        padding: 22,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              סימולטור ציון סופי ויעד בחינה
            </h3>
            <small style={{ color: 'var(--text-muted)' }}>
              {courseInfo.name || 'הקורס'} · {courseInfo.grade || `בחינה ${examWeight}% · מטלות ${hwWeight + quizWeight}%`}
            </small>
          </div>
        </div>

        <span className="pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontWeight: 700 }}>
          יעד אישי: {targetFinal}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
          <span>ממוצע מטלות / מעבדות ({hwWeight}%):</span>
          <input
            type="number"
            min="0"
            max="100"
            value={hwGrade}
            onChange={e => setHwGrade(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.95rem' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
          <span>בחנים / שאלות אמריקאיות ({quizWeight}%):</span>
          <input
            type="number"
            min="0"
            max="100"
            value={quizGrade}
            onChange={e => setQuizGrade(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.95rem' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
          <span>יעד ציון סופי מבוקש:</span>
          <input
            type="number"
            min="55"
            max="100"
            value={targetFinal}
            onChange={e => setTargetFinal(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.95rem' }}
          />
        </label>
      </div>

      {/* Target Requirement Callout */}
      <div
        style={{
          padding: 16,
          borderRadius: 'var(--radius-md)',
          background: requiredExamGrade <= 100 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: requiredExamGrade <= 100 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Target size={18} style={{ color: requiredExamGrade <= 100 ? 'var(--green)' : 'var(--red)' }} />
          <b style={{ color: requiredExamGrade <= 100 ? 'var(--green)' : 'var(--red)', fontSize: '0.98rem' }}>
            {requiredExamGrade <= 100 ? (
              `כדי להשיג ציון ${targetFinal}, עליך לקבל לפחות ${requiredExamGrade} בבחינה הסופית!`
            ) : (
              `כדי להשיג ציון ${targetFinal} נדרש מעל 100 (${requiredExamGrade}) בבחינה. מומלץ לעדכן את ציוני המטלות.`
            )}
          </b>
        </div>
        <small style={{ color: 'var(--text-muted)', display: 'block' }}>
          * שים לב: לפי תקנון האקדמיה חובה לקבל לפחות 55 בבחינה כדי לעבור את הקורס, ללא קשר לציון המטלות.
        </small>
      </div>

      {/* What-If Slider */}
      <div style={{ background: 'var(--bg-elevated)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            סימולציית "מה אם?": בחר ציון במבחן
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
            בחינה: {hypoExamGrade} נק׳
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={hypoExamGrade}
          onChange={e => setHypoExamGrade(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', margin: '8px 0 14px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>ציון סופי משוקלל:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {calculatedFinal}
            </span>
          </div>

          <span
            className="pill"
            style={{
              background: status.bg,
              color: status.color,
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '6px 12px'
            }}
          >
            {status.text}
          </span>
        </div>
      </div>
    </div>
  );
}
