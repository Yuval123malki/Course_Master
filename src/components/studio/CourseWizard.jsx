import React, { useState, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  UploadCloud,
  FileCode,
  Trash2,
  Paperclip,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { compileCourseFromSources } from './CourseCompiler';
import { navigate } from '../../utils/dom';

export function CourseWizard({ onClose }) {
  const { createCourse } = useCourse();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompiling, setIsCompiling] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    code: '',
    institution: '',
    category: 'math',
    credits: '4.00',
    lecturers: '',
    tutors: '',
    year: 'תשפ״ו',
    semester: 'סמסטר א׳',
    examDuration: '3 שעות',
    examStructure: '2 שאלות פתוחות + 6 שאלות ברירה אמריקאיות',
    syllabusRaw: '',
    studyMaterialsRaw: '',
    examsRaw: ''
  });

  // Track uploaded files per step
  const [stepFiles, setStepFiles] = useState({
    step1: [],
    step2: [],
    step3: [],
    step4: [],
    step5: []
  });

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper: Read and parse uploaded files
  const handleFileUpload = async (e, stepKey) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFilesMeta = [];

    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      newFilesMeta.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: ext
      });

      // 1. JSON handling (auto-detect full course or partial structures)
      if (ext === 'json') {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          // If it's a full course export:
          if (parsed.courseData || parsed.COURSE) {
            const cd = parsed.courseData || parsed;
            const cInfo = cd.COURSE || {};
            setFormData(prev => ({
              ...prev,
              title: cInfo.name || prev.title,
              titleEn: cInfo.nameEn || prev.titleEn,
              code: cInfo.code || prev.code,
              institution: cInfo.inst || prev.institution,
              credits: cInfo.credits ? String(cInfo.credits).replace(/[^0-9.]/g, '') : prev.credits,
              lecturers: cInfo.lecturers || prev.lecturers,
              tutors: cInfo.tutors || prev.tutors,
              syllabusRaw: (cd.TOPICS || []).map((t, idx) => `${idx + 1}. ${t.title || t.name}`).join('\n') || prev.syllabusRaw,
              studyMaterialsRaw: (cd.TOPICS || []).flatMap(t => (t.sec || []).map(s => `${s.h}:\n${s.html || ''}`)).join('\n\n') || prev.studyMaterialsRaw,
              examsRaw: (cd.QUESTIONS || []).map((q, idx) => `שאלה ${idx + 1}: ${q.q || ''}\nפתרון: ${q.sol || ''}`).join('\n\n') || prev.examsRaw
            }));
            showNotice(`הקובץ "${file.name}" זוהה כחבילת קורס מלאה! כל השדות מולאו אוטומטית.`);
            continue;
          }

          // If it's a syllabus or topics JSON array:
          if (Array.isArray(parsed)) {
            const listText = parsed.map((item, idx) => typeof item === 'string' ? `${idx + 1}. ${item}` : `${idx + 1}. ${item.title || item.name || JSON.stringify(item)}`).join('\n');
            if (stepKey === 'step2') {
              updateField('syllabusRaw', prev => prev ? `${prev}\n${listText}` : listText);
            }
          }
        } catch (err) {
          console.warn('Failed parsing JSON file', err);
        }
      }

      // 2. Text / Markdown / Code / TeX files
      else if (['txt', 'md', 'tex', 'csv', 'html', 'js'].includes(ext)) {
        try {
          const text = await file.text();
          if (stepKey === 'step2') {
            updateField('syllabusRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${text}` : text);
          } else if (stepKey === 'step3') {
            updateField('studyMaterialsRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${text}` : text);
          } else if (stepKey === 'step4') {
            updateField('examsRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${text}` : text);
          } else if (stepKey === 'step1') {
            // Suggest title from first lines
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length > 0 && !formData.title) {
              updateField('title', lines[0].slice(0, 50));
            }
            updateField('syllabusRaw', prev => prev ? `${prev}\n${text}` : text);
          }
          showNotice(`הקובץ "${file.name}" נטען והתוכן נוסף בהצלחה.`);
        } catch (err) {
          console.warn('Failed reading text file', err);
        }
      }

      // 3. Binary docs (DOCX, PDF) - Extract XML text if possible, register file
      else {
        try {
          const text = await file.text();
          // Extract plain text between tags if DOCX XML strings exist
          const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/[^\u0590-\u05FFa-zA-Z0-9\s.,?!:;()\-]/g, ' ').replace(/\s+/g, ' ').trim();
          if (cleanText.length > 60) {
            if (stepKey === 'step2') {
              updateField('syllabusRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${cleanText}` : cleanText);
            } else if (stepKey === 'step3') {
              updateField('studyMaterialsRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${cleanText}` : cleanText);
            } else if (stepKey === 'step4') {
              updateField('examsRaw', prev => prev ? `${prev}\n\n// מקור: ${file.name}\n${cleanText}` : cleanText);
            }
            showNotice(`הקובץ "${file.name}" נקרא והטקסט חולץ בהצלחה.`);
          } else {
            showNotice(`הקובץ "${file.name}" נרשם כמסמך מקור עבור הקורס.`);
          }
        } catch (err) {
          showNotice(`הקובץ "${file.name}" צורף בהצלחה.`);
        }
      }
    }

    setStepFiles(prev => ({
      ...prev,
      [stepKey]: [...prev[stepKey], ...newFilesMeta]
    }));

    e.target.value = '';
  };

  const removeFile = (stepKey, index) => {
    setStepFiles(prev => ({
      ...prev,
      [stepKey]: prev[stepKey].filter((_, i) => i !== index)
    }));
  };

  const loadPreset = (type) => {
    if (type === 'calc') {
      setFormData({
        title: 'חדו״א 1 (חשבון אינפיניטסימלי)',
        titleEn: 'Calculus 1',
        code: '621103',
        institution: 'הפקולטה למדעים מדויקים',
        category: 'math',
        credits: '5.00',
        lecturers: 'פרופ׳ אהרון גולד',
        tutors: 'רוני שלום, שיר אטיאס',
        year: 'תשפ״ו',
        semester: 'סמסטר א׳',
        examDuration: '3 שעות',
        examStructure: '3 שאלות הוכחה וחישוב + 5 שאלות ברירה',
        syllabusRaw: `1. שדה הממשיים, חסמים ואקסיומת השלמות\n2. סדרות, גבול של סדרה ומשפטי גבולות\n3. פונקציות ממשיות וגבולות של פונקציות\n4. רציפות, משפטי ויירשטראס ומשפט ערך הביניים\n5. נגזרות, כללי גזירה ומשפטי פרמה, רול ולגראנז׳\n6. חקירת פונקציות, נקודות פיתול ואסימפטוטות\n7. טורים מספריים ומבחני התכנסות`,
        studyMaterialsRaw: `משפט לגראנז׳ (ערך הממוצע): תהי f רציפה ב-[a,b] וגזירה ב-(a,b). אזי קיימת c ב-(a,b) כך ש-f'(c) = (f(b)-f(a))/(b-a).\nאקסיומת השלמות: לכל תת-קבוצה לא ריקה וחסומה מלעיל של R קיים חסם עליון (סופרמום).\nכלל לופיטל: כאשר מקבלים גבול מגבול 0/0 או inf/inf ניתן לגזור מונה ומכנה בנפרד.`,
        examsRaw: `שאלה 1 (2025 א׳ מועד א׳): הוכיחו לפי הגדרת הגבול של קושי כי lim_{x->2} (3x + 1) = 7.\nשאלה 2 (2025 א׳ מועד ב׳): תהי f רציפה ב-[0,1] כך ש-f(0)=f(1). הוכיחו שקיימת c כך ש-f(c) = f(c + 1/2).`
      });
      showNotice('תבנית חדו״א 1 נטענה בהצלחה');
    } else if (type === 'os') {
      setFormData({
        title: 'מערכות הפעלה',
        titleEn: 'Operating Systems',
        code: '623413',
        institution: 'הפקולטה למדעי המחשב',
        category: 'cs',
        credits: '4.00',
        lecturers: 'ד"ר מיכאל ברגר',
        tutors: 'איתמר גלבוע, עדן שוורץ',
        year: 'תשפ״ו',
        semester: 'סמסטר ב׳',
        examDuration: '2.5 שעות',
        examStructure: 'שאלות ניתוח זיכרון, Threads וסנכרון',
        syllabusRaw: `1. מבוא למערכות הפעלה, פסיקות וקריאות מערכת (System Calls)\n2. תהליכים (Processes) וחוטים (Threads)\n3. תזמון מעבד (CPU Scheduling - FCFS, SJF, Round Robin)\n4. סנכרון תהליכים, קטע קריטי, מנעולים וסמפורים (Semaphores)\n5. קיפאון (Deadlocks) ומניעת קיפאון (Banker's Algorithm)\n6. ניהול זיכרון, דפדוף (Paging) וזיכרון וירטואלי\n7. מערכות קבצים (File Systems) וניהול דיסק`,
        studyMaterialsRaw: `סמפור הוא משתנה שלם המאפשר סנכרון עם שתי פעולות אטומיות: wait() (או P) ו-signal() (או V).\nתנאי קופמן לקיפאון: 1. הדדיות (Mutual Exclusion) 2. החזק והמתן 3. אין הפקעה 4. המתנה מעגלית.`,
        examsRaw: `שאלה 1 (מבחן 2025): ממשו פתרון לבעיית הקוראים והכותבים באמצעות סמפורים כך שאין הרעבה לקוראים.\nשאלה 2 (מבחן 2025): חשבו את זמן ההמתנה הממוצע בשיטת Round Robin עם Quantum = 4ms.`
      });
      showNotice('תבנית מערכות הפעלה נטענה בהצלחה');
    }
  };

  const handleCompileAndPublish = () => {
    if (!formData.title.trim()) {
      alert('אנא הזן לפחות את שם הקורס!');
      return;
    }

    setIsCompiling(true);
    setTimeout(() => {
      // Gather all uploaded files across steps to include in inventoryData
      const allFiles = Object.entries(stepFiles).flatMap(([step, files]) =>
        files.map(f => ({
          filename: f.name,
          path: f.name,
          classification: step === 'step1' ? 'סילבוס רשמי' : step === 'step2' ? 'סילבוס ונושאים' : step === 'step3' ? 'חומרי לימוד ומצגות' : step === 'step4' ? 'שאלוני בחינה' : 'חבילת קורס'
        }))
      );

      const generated = compileCourseFromSources({
        ...formData,
        uploadedFiles: allFiles
      });

      createCourse(generated);
      setIsCompiling(false);
      try {
        localStorage.setItem('courseforge_has_selected', 'true');
      } catch (e) {}
      if (onClose) onClose();
      navigate('home');
    }, 800);
  };

  const steps = [
    { num: 1, title: 'פרטי הקורס', icon: <GraduationCap size={18} /> },
    { num: 2, title: 'סילבוס ונושאים', icon: <BookOpen size={18} /> },
    { num: 3, title: 'חומרי לימוד', icon: <FileText size={18} /> },
    { num: 4, title: 'מבחנים ושאלות', icon: <HelpCircle size={18} /> },
    { num: 5, title: 'בחינה והפקה', icon: <Clock size={18} /> }
  ];

  // Helper render component for step file uploader
  const renderUploader = (stepKey, label, subtext, accept = '.txt,.md,.json,.pdf,.docx,.tex,.csv') => {
    const inputRef = useRef(null);
    const files = stepFiles[stepKey] || [];

    return (
      <div
        className="wizard-uploader-box"
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          background: 'var(--bg-elevated)',
          marginBottom: 16,
          transition: 'border-color 0.2s ease'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFileUpload(e, stepKey)}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <b style={{ color: 'var(--text-primary)', fontSize: '0.92rem', display: 'block' }}>{label}</b>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtext}</small>
            </div>
          </div>

          <button
            type="button"
            className="ghost-button"
            onClick={() => inputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)'
            }}
          >
            <Paperclip size={15} />
            <span>בחר קבצים להעלאה</span>
          </button>
        </div>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {files.map((f, idx) => (
              <span
                key={idx}
                className="pill"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px'
                }}
              >
                <FileCode size={13} style={{ color: 'var(--primary)' }} />
                <span>{f.name} ({f.size})</span>
                <button
                  type="button"
                  onClick={() => removeFile(stepKey, idx)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--red)', display: 'flex' }}
                  title="הסר קובץ"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div
        className="search-dialog wizard-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="אשף יצירת אתר קורס חדש"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 860, width: '94%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="wizard-header">
          <div>
            <span className="eyebrow">CourseForge Studio</span>
            <h2 style={{ margin: '4px 0 6px 0', fontSize: '1.45rem' }}>יצירת אתר למידה אינטראקטיבי לקורס חדש</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              העלה קבצים או הדבק טקסט בכל שלב (סילבוס, מצגות, סיכומים ושאלונים). המערכת תייצר עבורך אתר למידה מלא.
            </p>
          </div>
          <div className="preset-buttons" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>תבניות מהירות לדוגמה:</span>
            <button className="pill" onClick={() => loadPreset('calc')}>📐 חדו״א 1 (מתמטיקה)</button>
            <button className="pill" onClick={() => loadPreset('os')}>💻 מערכות הפעלה (מדמ״ח)</button>
          </div>
        </div>

        {notification && (
          <div
            style={{
              margin: '12px 0',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: notification.type === 'success' ? '1px solid var(--green)' : '1px solid var(--red)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.88rem',
              color: 'var(--text-primary)'
            }}
          >
            {notification.type === 'success' ? <Check size={16} style={{ color: 'var(--green)' }} /> : <AlertCircle size={16} style={{ color: 'var(--red)' }} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Wizard Steps Bar */}
        <div className="wizard-stepper" style={{ marginTop: 16 }}>
          {steps.map(s => (
            <button
              key={s.num}
              className={`wizard-step-btn ${currentStep === s.num ? 'active' : currentStep > s.num ? 'done' : ''}`}
              onClick={() => setCurrentStep(s.num)}
            >
              <span className="step-circle">{currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Wizard Step Content */}
        <div className="wizard-body surface" style={{ marginTop: 16, padding: 22, borderRadius: 'var(--radius-lg)' }}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>שלב 1: פרטי הקורס והגדרות בסיס</h3>
                <small style={{ color: 'var(--text-muted)' }}>ניתן להעלות קובץ סילבוס למילוי אוטומטי</small>
              </div>

              {renderUploader(
                'step1',
                'העלאת קובץ סילבוס / קורס למילוי אוטומטי (PDF, DOCX, TXT, JSON)',
                'העלה קובץ סילבוס רשמי או חבילת JSON שלמה של הקורס לחילוץ אוטומטי של הפרטים'
              )}

              <div className="form-row" style={{ marginTop: 14 }}>
                <label>
                  תחום הקורס
                  <select value={formData.category} onChange={e => updateField('category', e.target.value)}>
                    <option value="math">📐 מתמטיקה ומדעים מדויקים (בדידה, ליניארית, חדו״א)</option>
                    <option value="cs">💻 מדעי המחשב ואלגוריתמים</option>
                    <option value="web">🌐 פיתוח תוכנה ואפליקציות אינטרנט</option>
                    <option value="general">📚 קורס אקדמי כללי / הנדסי</option>
                  </select>
                </label>

                <label className="grow">
                  שם הקורס (עברית) *
                  <input
                    value={formData.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="לדוגמה: מתמטיקה בדידה, חדו״א 1, מערכות הפעלה"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  קוד קורס
                  <input
                    value={formData.code}
                    onChange={e => updateField('code', e.target.value)}
                    placeholder="לדוגמה: 621101"
                  />
                </label>

                <label className="grow">
                  שם הקורס (באנגלית)
                  <input
                    value={formData.titleEn}
                    onChange={e => updateField('titleEn', e.target.value)}
                    placeholder="לדוגמה: Discrete Mathematics"
                  />
                </label>

                <label>
                  מוסד אקדמי
                  <input
                    value={formData.institution}
                    onChange={e => updateField('institution', e.target.value)}
                    placeholder="לדוגמה: המסלול האקדמי המכללה למינהל"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  נקודות זכות (נ"ז)
                  <input
                    value={formData.credits}
                    onChange={e => updateField('credits', e.target.value)}
                    placeholder="4.00"
                  />
                </label>
                <label className="grow">
                  מרצים
                  <input
                    value={formData.lecturers}
                    onChange={e => updateField('lecturers', e.target.value)}
                    placeholder="פרופ׳..., ד״ר..."
                  />
                </label>
                <label className="grow">
                  מתרגלים
                  <input
                    value={formData.tutors}
                    onChange={e => updateField('tutors', e.target.value)}
                    placeholder="שמות המתרגלים"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>שלב 2: סילבוס ורשימת נושאי הקורס</h3>
                <small style={{ color: 'var(--text-muted)' }}>כל סעיף ממוספר יהפוך לפרק לימוד שלם</small>
              </div>

              {renderUploader(
                'step2',
                'העלאת קובץ סילבוס או רשימת נושאים (TXT, MD, PDF, DOCX, JSON)',
                'העלה קובץ נושאים. הטקסט יחולץ אוטומטית ויתווסף לתיבה מטה'
              )}

              <label className="answer-label" style={{ marginTop: 12 }}>
                רשימת נושאי הסילבוס (שורה לכל נושא / פרק, או ערוך ידנית):
                <textarea
                  value={formData.syllabusRaw}
                  onChange={e => updateField('syllabusRaw', e.target.value)}
                  placeholder={`1. לוגיקה פסוקית ופרדיקטים\n2. תורת הקבוצות וקבוצת החזקה\n3. יחסים ויחסי שקילות\n4. אינדוקציה מתמטית ורקורסיה\n5. קומבינטוריקה וספירה`}
                  rows={9}
                />
              </label>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>שלב 3: חומרי לימוד, סיכומים, הגדרות ונוסחאות</h3>
                <small style={{ color: 'var(--text-muted)' }}>תומך בנוסחאות KaTeX, קוד ומסמכים</small>
              </div>

              {renderUploader(
                'step3',
                'העלאת סיכומים, מצגות, דפי נוסחאות וקוד (TXT, MD, TEX, PDF, DOCX, JSON)',
                'ניתן להעלות מספר קבצים במקביל. תוכנם ייסרק ויסווג לפרקי הלימוד'
              )}

              <label className="answer-label" style={{ marginTop: 12 }}>
                תקצירי תאוריה, נוסחאות KaTeX ודגשים מרכזיים (הדבק או ערוך את הטקסט שחולץ):
                <textarea
                  value={formData.studyMaterialsRaw}
                  onChange={e => updateField('studyMaterialsRaw', e.target.value)}
                  placeholder={`נוסחאות שחובה להכיר:\n- דה מורגן: ¬(p ∧ q) ≡ ¬p ∨ ¬q\n- קבוצת החזקה: |P(A)| = 2^|A|\n- משפט הממדים: dim(U+W) = dim(U) + dim(W) - dim(U∩W)`}
                  rows={9}
                />
              </label>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>שלב 4: שאלוני מבחנים, פתרונות ומאגרי שאלות</h3>
                <small style={{ color: 'var(--text-muted)' }}>שאלות אמריקאיות, שאלות פתוחות ורמזים</small>
              </div>

              {renderUploader(
                'step4',
                'העלאת שאלוני מבחן ופתרונות (DOCX, PDF, TXT, JSON)',
                'העלה קובצי בחינה מקוריים. המערכת תזהה את השאלות ותבנה מהן בנק תרגול'
              )}

              <label className="answer-label" style={{ marginTop: 12 }}>
                שאלות בחינה ופתרונות (המערכת תסווג ותייצר בנק שאלות ופתרונות צעד-אחר-צעד):
                <textarea
                  value={formData.examsRaw}
                  onChange={e => updateField('examsRaw', e.target.value)}
                  placeholder={`שאלה 1 (מבחן 2025): הוכיחו באינדוקציה כי 1 + 2 + ... + n = n(n+1)/2.\nפתרון: בסיס n=1: מתקיים. הנחה: נניח עבור k. צעד: נוסיף k+1 ונקבל...`}
                  rows={9}
                />
              </label>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>שלב 5: מבנה הבחינה, טיימר והפקת האתר</h3>
                <small style={{ color: 'var(--text-muted)' }}>הגדרות סימולציית הבחינה והפעלה</small>
              </div>

              {renderUploader(
                'step5',
                'ייבוא חבילת קורס מוכנה מראש (Full Course Package JSON)',
                'אם יש ברשותך קובץ JSON שלם של קורס אחר, העלה אותו כאן לייבוא מיידי',
                '.json'
              )}

              <div className="form-row" style={{ marginTop: 14 }}>
                <label>
                  משך בחינה רשמי (שעון עצר)
                  <select value={formData.examDuration} onChange={e => updateField('examDuration', e.target.value)}>
                    <option value="2 שעות">2 שעות (120 דקות)</option>
                    <option value="2.5 שעות">2.5 שעות (150 דקות)</option>
                    <option value="3 שעות">3 שעות (180 דקות)</option>
                    <option value="3.5 שעות">3.5 שעות (210 דקות)</option>
                  </select>
                </label>

                <label className="grow">
                  מבנה שאלון הבחינה
                  <input
                    value={formData.examStructure}
                    onChange={e => updateField('examStructure', e.target.value)}
                    placeholder="לדוגמה: 2 שאלות פתוחות (60%) + 6 שאלות ברירה (40%)"
                  />
                </label>
              </div>

              <div className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', marginTop: 20, padding: 18 }}>
                <div className="ttl" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
                  <Sparkles size={18} /> מה ייווצר עבור הקורס?
                </div>
                <ul style={{ margin: '10px 0 0', paddingRight: 20, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>✓ אתר למידה אינטראקטיבי מלא הכולל 22 מסכים ייעודיים.</li>
                  <li>✓ פרקי לימוד מפורטים עם תוכן, הגדרות ונוסחאות KaTeX חדות.</li>
                  <li>✓ מאגר שאלות עם פתרונות מלאים, רמזים מדורגים ומעקב עצמי.</li>
                  <li>✓ סימולציות בחינה מלאות בזמן אמת עם טיימר וחישוב ציון.</li>
                  <li>✓ כרטיסיות זיכרון פעיל (3D Flashcards) וקטלוג מלכודות בחינה.</li>
                  <li>✓ מעבדה אינטראקטיבית ולוח מעקב התקדמות אישי השמור בדפדפן.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="wizard-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div>
            {currentStep > 1 && (
              <button
                className="ghost-button"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ChevronRight size={18} />
                הקודם
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ghost-button" onClick={onClose}>
              ביטול
            </button>

            {currentStep < 5 ? (
              <button
                className="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                המשך לשלב הבא
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button
                className="primary"
                onClick={handleCompileAndPublish}
                disabled={isCompiling}
                style={{ background: 'var(--green)', borderColor: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Sparkles size={18} />
                {isCompiling ? 'מחולל אתר למידה...' : 'חולל והפעל אתר למידה עכשיו!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
