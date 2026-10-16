import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  UploadCloud,
  Check,
  AlertCircle,
  X,
  Sparkles,
  BookOpen,
  FileText,
  FolderGit2,
  FileCheck2,
  Calculator,
  Eye
} from 'lucide-react';
import { useCourse } from '../../context/CourseStore';
import { compileCourseFromSources } from './CourseCompiler';
import { parseRepositoryFile, REPO_CATEGORIES } from '../../utils/fileExtractor';
import { navigate } from '../../utils/dom';

const PRESET_REPOSITORIES = [
  {
    id: 'calc',
    label: 'חדו״א 1',
    title: 'חדו״א 1 (חשבון אינפיניטסימלי)',
    code: '621103',
    category: 'math',
    institution: 'הפקולטה למדעים מדויקים',
    topics: [
      'שדה הממשיים, חסמים ואקסיומת השלמות',
      'סדרות, גבול של סדרה ומשפטי גבולות',
      'פונקציות ממשיות וגבולות של פונקציות',
      'רציפות, משפטי ויירשטראס ומשפט ערך הביניים',
      'נגזרות, כללי גזירה ומשפטי פרמה, רול ולגראנז׳',
      'חקירת פונקציות, נקודות פיתול וכלל לופיטל',
      'טורים מספריים ומבחני התכנסות'
    ],
    sampleFiles: [
      {
        id: 'sample-syl-1',
        name: 'Syllabus_Calculus1_2026.txt',
        ext: 'txt',
        sizeFormatted: '4 KB',
        category: 'syllabus',
        content: '1. שדה הממשיים, חסמים ואקסיומת השלמות\n2. סדרות וגבול של סדרה\n3. רציפות ומשפטי הקטע הסגור\n4. נגזרות ומשפט לגראנז׳\n5. טורים ומבחני התכנסות'
      },
      {
        id: 'sample-sum-1',
        name: 'סיכום_הרצאות_רציפות_ונגזרות.md',
        ext: 'md',
        sizeFormatted: '18 KB',
        category: 'summary',
        content: 'משפט ערך הביניים (קוושי): אם f רציפה בקטע סגור [a,b] אז היא מקבלת כל ערך בין f(a) ל-f(b).\n\nמשפט ויירשטראס: פונקציה רציפה בקטע סגור חסומה בו ומקבלת בו מקסימום ומינימום מוחלטים.\n\nמשפט לגראנז׳ (ערך הממוצע): תהי f רציפה ב-[a,b] וגזירה ב-(a,b), אז קיימת נקודה c בקטע הפתוח שבה השיפוע המשיק שווה לשיפוע המיתר.'
      },
      {
        id: 'sample-exam-1',
        name: 'מבחן_חדוא1_2025_מועד_א_ופתרון.docx',
        ext: 'docx',
        sizeFormatted: '42 KB',
        category: 'exam',
        content: 'שאלה 1: הוכיחו לפי הגדרת הגבול כי הגבול של 3x+1 כאשר x שואף ל-2 הוא 7.\nפתרון: יהי אפסילון חיובי. נבחר דלתא שווה אפסילון חלקי 3 ואז לכל x המקיים |x-2| < delta מתקיים |3x+1 - 7| = 3|x-2| < epsilon.\n\nשאלה 2: תהי f פונקציה רציפה ב-[0,1] המקיימת f(0)=f(1). הוכיחו כי קיימת c כך ש-f(c)=f(c+0.5).\nפתרון: נגדיר פונקציית עזר g(x) = f(x+0.5) - f(x) בקטע [0, 0.5]. מתקיים g(0) = -g(0.5) ולכן לפי משפט ערך הביניים קיימת נקודת התאפסות.'
      },
      {
        id: 'sample-form-1',
        name: 'דף_נוסחאות_גזירה_וטורים.txt',
        ext: 'txt',
        sizeFormatted: '6 KB',
        category: 'formula',
        content: 'נגזרת מכפלה: (uv)\' = u\'v + uv\'\nכלל לופיטל: lim f(x)/g(x) = lim f\'(x)/g\'(x)\nטור הנדסי מתכנס: sum q^n = 1 / (1 - q) עבור |q| < 1'
      }
    ]
  },
  {
    id: 'os',
    label: 'מערכות הפעלה',
    title: 'מערכות הפעלה',
    code: '623413',
    category: 'cs',
    institution: 'הפקולטה למדעי המחשב',
    topics: [
      'מבוא למערכות הפעלה, פסיקות וקריאות מערכת (System Calls)',
      'תהליכים (Processes), PCB והחלפת הקשר',
      'חוטים (Threads) ומקבילות',
      'תזמון מעבד (FCFS, SJF, Round Robin)',
      'סנכרון תהליכים, מנעולים (Mutex) וסמפורים',
      'קיפאון (Deadlocks) ואלגוריתם הבנקאי',
      'ניהול זיכרון, דפדוף (Paging) וזיכרון וירטואלי'
    ],
    sampleFiles: [
      {
        id: 'os-syl-1',
        name: 'OS_Syllabus_2026.txt',
        ext: 'txt',
        sizeFormatted: '3 KB',
        category: 'syllabus',
        content: '1. תהליכים וחוטים\n2. תזמון מעבד\n3. סנכרון תהליכים וסמפורים\n4. קיפאון (Deadlocks)\n5. זיכרון וירטואלי ודפדוף'
      },
      {
        id: 'os-sum-1',
        name: 'סיכום_סנכרון_וסמפורים.md',
        ext: 'md',
        sizeFormatted: '22 KB',
        category: 'summary',
        content: 'סמפור הוא כלי סנכרון בעל שתי פעולות אטומיות: wait (או P) ו-signal (או V).\n\nארבעת תנאי קופמן לקיפאון (Deadlock): מניעה הדדית, החזק והמתן, אין הפקעה, והמתנה מעגלית. שבירת אחד התנאים מונעת קיפאון.'
      },
      {
        id: 'os-exam-1',
        name: 'מבחן_מערכות_הפעלה_2025_מועד_א.docx',
        ext: 'docx',
        sizeFormatted: '38 KB',
        category: 'exam',
        content: 'שאלה 1: הסבירו מהו ההבדל המרכזי בין תהליך (Process) לחוט (Thread) מבחינת מרחב הזיכרון.\nפתרון: תהליכים רצים במרחבי כתובות וירטואליים נפרדים, בעוד שחוטים באותו תהליך חולקים את קוד התוכנית, המידע הגלובלי וה-Heap, אך מחזיקים מחסנית (Stack) ואוגרים משלהם.\n\nשאלה 2: מתי תזמון Round Robin מתנהג כמו FCFS?\nפתרון: כאשר קוונטום הזמן (Time Quantum) גדול יותר מזמן הריצה (Burst Time) של התהליך הארוך ביותר במערכת.'
      }
    ]
  }
];

export function CourseWizard({ onClose }) {
  const { createCourse } = useCourse();
  const universalInputRef = useRef(null);
  const bucketInputRef = useRef(null);
  const [activeBucketUpload, setActiveBucketUpload] = useState(null);

  // Course Identity
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('cs');
  const [institution, setInstitution] = useState('');

  // Repository Files State
  const [repoFiles, setRepoFiles] = useState([]);
  const [activeBucketFilter, setActiveBucketFilter] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Extracted / Editable Chapters
  const [topics, setTopics] = useState([]);
  const [newTopicText, setNewTopicText] = useState('');

  // Quick Text Snippet Modal/Input (for pasting raw text directly into the repo)
  const [showTextAdder, setShowTextAdder] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCategory, setSnippetCategory] = useState('exam');
  const [snippetContent, setSnippetContent] = useState('');

  const [notice, setNotice] = useState(null);

  const triggerNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4500);
  };

  // Process dropped or selected files into the Repository
  const ingestFiles = async (fileList, forcedCategory = null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const parsedItems = [];
    let extractedTopics = [...topics];
    let detectedTitle = title;
    let detectedCode = code;
    let detectedInst = institution;

    for (const file of files) {
      const repoItem = await parseRepositoryFile(file, forcedCategory);
      parsedItems.push(repoItem);

      // If full JSON course export
      if (repoItem.parsedJson && (repoItem.parsedJson.courseData || repoItem.parsedJson.COURSE)) {
        const cd = repoItem.parsedJson.courseData || repoItem.parsedJson;
        const cInfo = cd.COURSE || {};
        if (cInfo.name && !detectedTitle) detectedTitle = cInfo.name;
        if (cInfo.code && !detectedCode) detectedCode = cInfo.code;
        if (cInfo.inst && !detectedInst) detectedInst = cInfo.inst;
        if (Array.isArray(cd.TOPICS) && cd.TOPICS.length > 0) {
          extractedTopics = cd.TOPICS.map(t => t.title || t.name).filter(Boolean);
        }
        continue;
      }

      // If syllabus file, auto-extract topics list
      if (repoItem.category === 'syllabus' && repoItem.content) {
        const lines = repoItem.content
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        const numbered = lines
          .filter(l => /^[0-9]+[.\-)]|^[-•*]/.test(l))
          .map(l => l.replace(/^[0-9]+[.\-)]\s*/, '').replace(/^[-*•]\s*/, '').trim())
          .filter(l => l.length > 2 && l.length < 110);

        if (numbered.length >= 2) {
          extractedTopics = numbered;
        } else if (extractedTopics.length === 0) {
          extractedTopics = lines.filter(l => l.length > 3 && l.length < 90).slice(0, 12);
        }
      }

      // Suggest course title from first uploaded filename if still empty
      if (!detectedTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/syllabus|exam|summary|סילבוס|מבחן|סיכום|פתרון|מועד|[0-9_-]/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanName.length >= 3) {
          detectedTitle = cleanName;
        }
      }
    }

    if (detectedTitle !== title) setTitle(detectedTitle);
    if (detectedCode !== code) setCode(detectedCode);
    if (detectedInst !== institution) setInstitution(detectedInst);
    if (extractedTopics.length > 0) setTopics(extractedTopics);

    setRepoFiles(prev => [...prev, ...parsedItems]);
    triggerNotice(`נוספו ${parsedItems.length} קבצים למאגר הקורס ונותחו אוטומטית!`);
  };

  const handleLoadPresetRepo = (preset) => {
    setTitle(preset.title);
    setCode(preset.code);
    setCategory(preset.category);
    setInstitution(preset.institution);
    setTopics(preset.topics);
    setRepoFiles(preset.sampleFiles);
    triggerNotice(`נטען מאגר דוגמה מלא עבור "${preset.label}" (כולל סילבוס, סיכומים ומבחני עבר).`);
  };

  const handleAddTextSnippet = () => {
    if (!snippetContent.trim()) return;
    const defaultName =
      snippetTitle.trim() ||
      (snippetCategory === 'exam'
        ? `מבחן_עבר_${repoFiles.filter(f => f.category === 'exam').length + 1}.txt`
        : snippetCategory === 'syllabus'
        ? 'סילבוס_הקורס.txt'
        : `סיכום_הרצאה_${repoFiles.filter(f => f.category === 'summary').length + 1}.txt`);

    const newItem = {
      id: `repo-snippet-${Date.now()}`,
      name: defaultName,
      ext: 'txt',
      sizeFormatted: `${Math.max(1, Math.round(snippetContent.length / 500))} KB`,
      category: snippetCategory,
      content: snippetContent.trim(),
      addedAt: Date.now()
    };

    setRepoFiles(prev => [...prev, newItem]);

    if (snippetCategory === 'syllabus') {
      const lines = snippetContent
        .split('\n')
        .map(l => l.replace(/^[0-9]+[.\-)]\s*/, '').replace(/^[-*•]\s*/, '').trim())
        .filter(l => l.length > 2);
      if (lines.length > 0) setTopics(lines);
    }

    setSnippetTitle('');
    setSnippetContent('');
    setShowTextAdder(false);
    triggerNotice(`הטקסט נשמר כקובץ "${defaultName}" במאגר הקורס.`);
  };

  const handleChangeFileCategory = (id, newCat) => {
    setRepoFiles(prev => prev.map(f => (f.id === id ? { ...f, category: newCat } : f)));
  };

  const handleRemoveRepoFile = (id) => {
    setRepoFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const handleAddTopic = () => {
    const trimmed = newTopicText.trim();
    if (!trimmed) return;
    setTopics(prev => [...prev, trimmed]);
    setNewTopicText('');
  };

  const handleBuildCourseFromRepo = () => {
    if (!title.trim()) {
      triggerNotice('נא להזין את שם הקורס לפני בניית האתר', 'error');
      return;
    }

    const compiled = compileCourseFromSources({
      title: title.trim(),
      code: code.trim(),
      institution: institution.trim(),
      category,
      customTopicsList: topics.map(t => t.trim()).filter(Boolean),
      repositoryFiles: repoFiles
    });

    createCourse(compiled);
    if (onClose) onClose();
    navigate('home');
  };

  // Counts per bucket
  const counts = {
    all: repoFiles.length,
    syllabus: repoFiles.filter(f => f.category === 'syllabus').length,
    summary: repoFiles.filter(f => f.category === 'summary').length,
    exam: repoFiles.filter(f => f.category === 'exam').length,
    formula: repoFiles.filter(f => f.category === 'formula').length
  };

  const visibleFiles = activeBucketFilter === 'all'
    ? repoFiles
    : repoFiles.filter(f => f.category === activeBucketFilter);

  return (
    <div className="search-overlay" onClick={onClose} style={{ padding: '3vh 16px' }}>
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="מאגר קבצים ומחולל קורס חדש"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 860,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FolderGit2 size={15} color="var(--primary)" />
              <span className="eyebrow" style={{ margin: 0 }}>Course Repository Builder</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
              הקמת מאגר קורס חדש (סילבוס, סיכומים ומבחני עבר)
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              העלה את כל קובצי הקורס שלך למאגר — המחולל יקרא את הסילבוס, הסיכומים ומבחני העבר ויבנה מהם אתר למידה שלם.
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="סגור">
            <X size={16} />
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Quick Demo Repositories Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 16,
              padding: '8px 12px',
              borderRadius: 10,
              background: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                טען מאגר קורס מוכן להדגמה:
              </span>
              {PRESET_REPOSITORIES.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className="ghost-button"
                  onClick={() => handleLoadPresetRepo(preset)}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="ghost-button"
              onClick={() => setShowTextAdder(!showTextAdder)}
              style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: 6 }}
            >
              <Plus size={13} />
              <span>הדבק טקסט ישירות למאגר</span>
            </button>
          </div>

          {notice && (
            <div
              style={{
                marginBottom: 14,
                padding: '9px 12px',
                borderRadius: 8,
                background: notice.type === 'error' ? 'var(--danger-subtle)' : 'var(--success-subtle)',
                color: notice.type === 'error' ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {notice.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
              <span>{notice.msg}</span>
            </div>
          )}

          {/* Step 1: Course Repository Identity */}
          <div className="form-row" style={{ marginBottom: 16 }}>
            <label className="grow">
              שם הקורס *
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="לדוגמה: אלגוריתמים, חדו״א 1, מערכות הפעלה..."
                autoFocus
              />
            </label>
            <label style={{ width: 120 }}>
              קוד קורס
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="623309"
              />
            </label>
            <label style={{ width: 150 }}>
              תחום
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="cs">מדעי המחשב</option>
                <option value="math">מתמטיקה</option>
                <option value="web">פיתוח תוכנה</option>
                <option value="general">קורס כללי</option>
              </select>
            </label>
            <label className="grow">
              מוסד / מרצה
              <input
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="מוסד אקדמי"
              />
            </label>
          </div>

          {/* Step 2: Universal Drag & Drop Repository Dropzone + 4 Folder Buckets */}
          <input
            ref={universalInputRef}
            type="file"
            multiple
            accept=".docx,.pdf,.txt,.md,.tex,.json,.csv"
            style={{ display: 'none' }}
            onChange={e => {
              ingestFiles(e.target.files, null);
              e.target.value = '';
            }}
          />
          <input
            ref={bucketInputRef}
            type="file"
            multiple
            accept=".docx,.pdf,.txt,.md,.tex,.json,.csv"
            style={{ display: 'none' }}
            onChange={e => {
              ingestFiles(e.target.files, activeBucketUpload);
              e.target.value = '';
            }}
          />

          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              ingestFiles(e.dataTransfer.files, null);
            }}
            style={{
              border: isDragging ? '2px dashed var(--primary)' : '1.5px dashed var(--border-strong)',
              borderRadius: 12,
              padding: '18px 20px',
              background: isDragging ? 'var(--primary-subtle)' : 'var(--bg-page)',
              marginBottom: 16,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <UploadCloud size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '0.94rem', display: 'block' }}>
                    גרור לכאן את כל קובצי הקורס או בחר לפי תיקייה
                  </b>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    תומך ב-Word (`.docx`), `.pdf`, `.txt`, `.md`, `.tex`, `.json` — המערכת תסווג ותחלץ את התוכן אוטומטית
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => universalInputRef.current?.click()}
                style={{ fontSize: '0.84rem', padding: '8px 14px' }}
              >
                <UploadCloud size={15} />
                <span>העלה קבצים למאגר</span>
              </button>
            </div>

            {/* 4 Repository Folder Buckets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 10 }}>
              {[
                { key: 'syllabus', title: 'סילבוס ותוכנית', desc: 'חילוץ פרקי הקורס', icon: <BookOpen size={15} color="var(--primary)" /> },
                { key: 'summary', title: 'סיכומים והרצאות', desc: 'בניית יחידות הלימוד', icon: <FileText size={15} color="var(--success)" /> },
                { key: 'exam', title: 'מבחני עבר ופתרונות', desc: 'בנק שאלות וסימולציות', icon: <FileCheck2 size={15} color="var(--accent)" /> },
                { key: 'formula', title: 'דפי נוסחאות', desc: 'נוסחאות ודף יום לפני', icon: <Calculator size={15} color="var(--warning)" /> }
              ].map(bucket => (
                <div
                  key={bucket.key}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {bucket.icon}
                        <b style={{ fontSize: '0.82rem' }}>{bucket.title}</b>
                      </div>
                      <span className="pill" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                        {counts[bucket.key]}
                      </span>
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', display: 'block' }}>
                      {bucket.desc}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setActiveBucketUpload(bucket.key);
                      setTimeout(() => bucketInputRef.current?.click(), 10);
                    }}
                    style={{ width: '100%', padding: '5px 8px', fontSize: '0.76rem' }}
                  >
                    <Plus size={13} />
                    <span>הוסף קובצי {REPO_CATEGORIES[bucket.key].badge}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Direct Text Snippet Adder */}
          {showTextAdder && (
            <div
              style={{
                border: '1px solid var(--border-strong)',
                borderRadius: 10,
                padding: 14,
                background: 'var(--bg-surface)',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: '0.88rem' }}>הוספת טקסט ישירות כקובץ במאגר</b>
                <button type="button" className="text-link" onClick={() => setShowTextAdder(false)} style={{ fontSize: '0.78rem' }}>
                  סגור
                </button>
              </div>
              <div className="form-row" style={{ marginBottom: 10 }}>
                <label className="grow">
                  שם המסמך
                  <input
                    value={snippetTitle}
                    onChange={e => setSnippetTitle(e.target.value)}
                    placeholder="לדוגמה: מבחן 2025 מועד א׳ / סיכום הרצאה 3"
                  />
                </label>
                <label style={{ width: 190 }}>
                  שיוך לתיקייה במאגר
                  <select value={snippetCategory} onChange={e => setSnippetCategory(e.target.value)}>
                    <option value="exam">מבחני עבר ופתרונות</option>
                    <option value="summary">סיכומים והרצאות</option>
                    <option value="syllabus">סילבוס ותוכנית קורס</option>
                    <option value="formula">דפי נוסחאות</option>
                  </select>
                </label>
              </div>
              <textarea
                value={snippetContent}
                onChange={e => setSnippetContent(e.target.value)}
                rows={4}
                placeholder="הדבק כאן את תוכן המבחן, הסיכום או הסילבוס..."
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-page)',
                  fontSize: '0.84rem',
                  marginBottom: 8
                }}
              />
              <button type="button" className="primary" onClick={handleAddTextSnippet} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                שמור במאגר הקורס
              </button>
            </div>
          )}

          {/* Two-Column Repository Inspector: Uploaded Files Tree + Extracted Syllabus Chapters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Column 1: Repository File Explorer */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 14,
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: '0.88rem' }}>קבצים במאגר הקורס ({repoFiles.length})</b>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    ['all', 'הכל'],
                    ['syllabus', 'סילבוס'],
                    ['summary', 'סיכומים'],
                    ['exam', 'מבחנים']
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveBucketFilter(key)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: activeBucketFilter === key ? 'var(--primary-subtle)' : 'transparent',
                        color: activeBucketFilter === key ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {visibleFiles.length === 0 ? (
                <div
                  style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    background: 'var(--bg-page)',
                    borderRadius: 8,
                    border: '1px dashed var(--border-subtle)'
                  }}
                >
                  טרם הועלו קבצים לתיקייה זו. העלה קובצי סילבוס, סיכומים או מבחני עבר למעלה.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                  {visibleFiles.map(file => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-page)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          {file.sizeFormatted} · {file.content ? `${file.content.length.toLocaleString()} תווים חולצו` : 'קובץ מקור'}
                        </small>
                      </div>

                      <select
                        value={file.category}
                        onChange={e => handleChangeFileCategory(file.id, e.target.value)}
                        style={{
                          padding: '3px 6px',
                          borderRadius: 6,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: 'var(--primary)'
                        }}
                      >
                        <option value="syllabus">סילבוס</option>
                        <option value="summary">סיכום / הרצאה</option>
                        <option value="exam">מבחן עבר</option>
                        <option value="formula">דף נוסחאות</option>
                      </select>

                      {file.content && (
                        <button
                          type="button"
                          onClick={() => setPreviewFile(previewFile?.id === file.id ? null : file)}
                          title="תצוגה מקדימה של הטקסט שחולץ"
                          style={{ color: 'var(--text-secondary)', padding: 4, display: 'flex' }}
                        >
                          <Eye size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveRepoFile(file.id)}
                        title="הסר מהמאגר"
                        style={{ color: 'var(--danger)', padding: 4, display: 'flex' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {previewFile && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 8,
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.78rem',
                    maxHeight: 110,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <b style={{ display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>
                    תוכן שחולץ מתוך {previewFile.name}:
                  </b>
                  {previewFile.content.slice(0, 600)}
                  {previewFile.content.length > 600 ? '...' : ''}
                </div>
              )}
            </div>

            {/* Column 2: Extracted Syllabus Chapters Preview & Editor */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 14,
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: '0.88rem' }}>מבנה פרקי הקורס ({topics.length})</b>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                  מחולץ אוטומטית מהסילבוס והסיכומים
                </small>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 175, overflowY: 'auto', marginBottom: 10 }}>
                {topics.length === 0 ? (
                  <div
                    style={{
                      padding: '22px 12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      background: 'var(--bg-page)',
                      borderRadius: 8,
                      border: '1px dashed var(--border-subtle)'
                    }}
                  >
                    העלה קובץ סילבוס/סיכומים לחילוץ אוטומטי של הפרקים, או הוסף פרקים ידנית למטה.
                  </div>
                ) : (
                  topics.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--bg-page)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 7,
                        padding: '4px 10px'
                      }}
                    >
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {idx + 1}.
                      </span>
                      <input
                        value={t}
                        onChange={e => setTopics(prev => prev.map((item, i) => (i === idx ? e.target.value : item)))}
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          fontSize: '0.84rem',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setTopics(prev => prev.filter((_, i) => i !== idx))}
                        style={{ color: 'var(--text-muted)', padding: 3, display: 'flex' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <input
                  value={newTopicText}
                  onChange={e => setNewTopicText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="הוסף פרק נוסף..."
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 7,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-page)',
                    fontSize: '0.82rem'
                  }}
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleAddTopic}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  <span>הוסף</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Repository Synthesis Summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-page)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>
              <b>סיכום המאגר:</b> {counts.syllabus} סילבוס · {counts.summary} סיכומים · {counts.exam} מבחני עבר · {counts.formula} דפי נוסחאות
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ghost-button" onClick={onClose}>
              ביטול
            </button>
            <button type="button" className="primary" onClick={handleBuildCourseFromRepo}>
              <Sparkles size={15} />
              <span>בנה קורס מכל קובצי המאגר</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
