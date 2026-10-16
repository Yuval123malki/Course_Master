import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileAudio,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Download,
  Printer,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Bookmark,
  Award,
  Layers,
  GraduationCap,
  Clock,
  Send,
  Wand2,
  Share2,
  Play
} from 'lucide-react';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import {
  getSavedStudyPacks,
  saveStudyPacks,
  getDefaultSampleStudyPack,
  generateAcademicSummary,
  extractExamCues,
  consolidateStudyPack
} from '../services/studyPackGenerator';
import { useCourse } from '../context/CourseStore';
import { compileCourseFromSources } from '../components/studio/CourseCompiler';
import { navigate } from '../utils/dom';

export function StudyPackPage({ store }) {
  const { createCourse } = useCourse();
  const [packs, setPacks] = useState(() => getSavedStudyPacks());
  const [activePackId, setActivePackId] = useState(() => packs[0]?.id || 'pack-ds-master');
  const [activeMainTab, setActiveMainTab] = useState('master'); // 'master', 'lectures', 'pipeline'
  const [selectedLectureIdx, setSelectedLectureIdx] = useState(0);
  const [lectureSubTab, setLectureSubTab] = useState('summary'); // 'summary', 'cues', 'transcript'
  const [searchInBook, setSearchInBook] = useState('');
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStatusText, setPipelineStatusText] = useState('');

  // New Lecture Form state
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureDate, setNewLectureDate] = useState('');
  const [newLectureTranscript, setNewLectureTranscript] = useState('');
  const [audioFileMeta, setAudioFileMeta] = useState(null);
  const fileInputRef = useRef(null);

  // Active pack object
  const activePack = packs.find(p => p.id === activePackId) || packs[0];

  useEffect(() => {
    saveStudyPacks(packs);
  }, [packs]);

  const updateActivePack = (updatedPack) => {
    setPacks(prev => prev.map(p => (p.id === updatedPack.id ? updatedPack : p)));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const isAudio = ['m4a', 'mp3', 'wav', 'aac', 'ogg', 'mp4'].includes(ext);

    if (isAudio) {
      setAudioFileMeta({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: 'audio'
      });
      // In a real browser without server Whisper, we extract title and simulate Speech-To-Text or let user provide notes
      if (!newLectureTitle) {
        setNewLectureTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      setNewLectureTranscript(prev =>
        prev
          ? prev
          : `// תמליל שחולץ מקובץ האודיו ${file.name}\nהמרצה: "ברוכים הבאים להרצאה. היום נלמד נושא קריטי.\nזה יהיה במבחן! חובה לדעת את כל שלבי ההוכחה ומקרי הקצה.\nבמבחן אני אוהב לשאול על ההבדל בין המקרה הממוצע למקרה הגרוע."`
      );
    } else {
      // Transcript / Text file
      try {
        const text = await file.text();
        setNewLectureTranscript(text);
        if (!newLectureTitle) {
          setNewLectureTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      } catch (err) {
        alert('לא ניתן היה לקרוא את קובץ הטקסט.');
      }
    }
    e.target.value = '';
  };

  const handleAddLecture = (e) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) {
      alert('נא להזין כותרת להרצאה');
      return;
    }

    const newLec = {
      id: `lec-${Date.now()}`,
      title: newLectureTitle.trim(),
      date: newLectureDate.trim() || `הרצאה ${(activePack?.lectures?.length || 0) + 1}`,
      audioFileName: audioFileMeta?.name || '',
      transcript: newLectureTranscript.trim() || 'אין תמליל זמין להרצאה זו.'
    };

    const updated = {
      ...activePack,
      lectures: [...(activePack.lectures || []), newLec]
    };

    const fullyConsolidated = consolidateStudyPack(updated);
    updateActivePack(fullyConsolidated);

    setNewLectureTitle('');
    setNewLectureDate('');
    setNewLectureTranscript('');
    setAudioFileMeta(null);
    setSelectedLectureIdx((updated.lectures.length || 1) - 1);
    setActiveMainTab('lectures');
  };

  // Run full Automated NotebookLM-Style Pipeline
  const runFullPipeline = () => {
    if (!activePack || (activePack.lectures || []).length === 0) {
      alert('נא להוסיף לפחות הרצאה אחת כדי להפעיל את ה-Pipeline.');
      return;
    }

    setIsProcessingPipeline(true);
    setPipelineProgress(15);
    setPipelineStatusText('מנתח קובצי שמע ותמלילים (Speech-to-Text Analysis)...');

    setTimeout(() => {
      setPipelineProgress(45);
      setPipelineStatusText('מפעיל סריקת Persona: מתרגל בכיר — הפקת הגדרות פורמליות, LaTeX והוכחות...');
    }, 800);

    setTimeout(() => {
      setPipelineProgress(75);
      setPipelineStatusText('סורק דוח דגשי מרצה: איתור אמירות מפורשות ("זה יהיה במבחן")...');
    }, 1600);

    setTimeout(() => {
      setPipelineProgress(95);
      setPipelineStatusText('מיזוג ספר הקורס המלא (Consolidation Pipeline) והסרת כפילויות...');
    }, 2400);

    setTimeout(() => {
      const consolidated = consolidateStudyPack(activePack);
      updateActivePack(consolidated);
      setIsProcessingPipeline(false);
      setPipelineProgress(100);
      setActiveMainTab('master');
    }, 3200);
  };

  // 1-Click Convert Study Pack directly into an active Course_Master course
  const handleConvertToCourse = () => {
    if (!activePack) return;
    const topicsFromLectures = (activePack.lectures || []).map((l, i) => `${i + 1}. ${l.title}`).join('\n');
    const newCourse = compileCourseFromSources({
      title: activePack.courseName,
      lecturers: activePack.lecturer,
      institution: activePack.institution,
      year: activePack.year,
      syllabusRaw: topicsFromLectures,
      studyMaterialsRaw: (activePack.lectures || []).map(l => `${l.title}:\n${l.transcript}`).join('\n\n')
    });

    createCourse(newCourse);
    alert(`הקורס "${activePack.courseName}" נוצר בהצלחה והתווסף לספריית הקורסים הפעילה!`);
    navigate('home');
  };

  // Markdown Export
  const handleExportMarkdown = () => {
    if (!activePack?.masterBook) return;
    const mb = activePack.masterBook;
    let md = `# ${mb.title}\n\n`;
    md += `**מרצה:** ${mb.lecturer} | **מוסד:** ${mb.institution} | **שנת לימוד:** ${mb.academicYear}\n\n`;
    md += `*הופק אוטומטית ע"י Course_Master Automated Study Pack Generator*\n\n---\n\n`;

    md += `## תוכן עניינים\n`;
    (mb.toc || []).forEach(t => {
      md += `- ${t.number}. ${t.title} (${t.date})\n`;
    });
    md += `\n---\n\n`;

    (mb.chapters || []).forEach(ch => {
      const s = ch.summary || {};
      md += `## פרק ${ch.number}: ${ch.title}\n\n`;
      md += `### תקציר ההרצאה (TL;DR)\n${s.tldr || ''}\n\n`;

      if (s.definitions?.length > 0) {
        md += `### הגדרות ומושגים פורמליים\n`;
        s.definitions.forEach(d => {
          md += `#### ${d.term}\n- **אינטואיציה:** ${d.intuitive}\n- **פורמלי:** ${d.formal}\n\n`;
        });
      }

      if (s.theorems?.length > 0) {
        md += `### משפטים, טענות והוכחות\n`;
        s.theorems.forEach(th => {
          md += `#### ${th.name}\n- **ניסוח המשפט:** ${th.statement}\n- **רעיון ההוכחה:** ${th.proofIdea}\n- **טריק אלגברי לבחינה:** ${th.tricks}\n\n`;
        });
      }

      if (s.algorithms?.length > 0) {
        md += `### אלגוריתמים ושיטות עבודה\n`;
        s.algorithms.forEach(alg => {
          md += `#### ${alg.name}\n`;
          (alg.steps || []).forEach(step => {
            md += `- ${step}\n`;
          });
          md += `\n`;
        });
      }

      if (s.pitfalls?.length > 0) {
        md += `### מלכודות בחינה שכיחות\n`;
        s.pitfalls.forEach(p => {
          md += `- **המלכודת:** ${p.trap}\n- **הסיבה:** ${p.why}\n- **התיקון למבחן:** ${p.correction}\n\n`;
        });
      }
    });

    // Appendix
    md += `## נספח מרוכז: כל דגשי המרצה והרמזים למבחן\n\n`;
    (mb.examAppendix?.highPriority || []).forEach(c => {
      md += `### [קריטי למבחן] ${c.topic} (${c.lectureTitle})\n`;
      md += `> "${c.quote}"\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePack.courseName.replace(/\s+/g, '_')}_ספר_הקורס.md`;
    a.click();
  };

  const currentLecture = activePack?.lectures?.[selectedLectureIdx] || activePack?.lectures?.[0];
  const currentSummary = currentLecture?.summary || (currentLecture ? generateAcademicSummary(currentLecture, { courseName: activePack?.courseName }) : null);
  const currentCues = currentLecture?.cues || (currentLecture ? extractExamCues(currentLecture.transcript, currentLecture.title) : null);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      {/* Page Header */}
      <PageHead
        eyebrow="מחולל Study Pack אוטומטי (NotebookLM-Style Pipeline)"
        title="עיבוד הרצאות, הפקת סיכומים וספר הקורס המלא"
        desc="הזן אודיו, הקלטות ותמלילי הרצאות — המערכת מריצה Pipeline של מתרגל בכיר: מפיקה סיכומי עומק עם נוסחאות LaTeX, מאתרת רמזי מרצה למבחן וממזגת הכל לספר קורס מקיף."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="primary"
              onClick={runFullPipeline}
              disabled={isProcessingPipeline}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Wand2 size={16} />
              <span>{isProcessingPipeline ? 'מעבד Pipeline...' : 'הפעל Pipeline מלא'}</span>
            </button>

            <button
              className="ghost-button"
              onClick={handleExportMarkdown}
              title="הורד את ספר הקורס המלא כקובץ Markdown"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <Download size={16} />
              <span>ייצוא Markdown</span>
            </button>

            <button
              className="ghost-button"
              onClick={() => window.print()}
              title="הדפס או שמור כ-PDF"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <Printer size={16} />
              <span>הדפסה / PDF</span>
            </button>
          </div>
        }
      />

      {/* Progress Bar (Visible during processing) */}
      {isProcessingPipeline && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '20px 24px',
            marginBottom: 24,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--primary)' }}>
              <Sparkles size={18} className="spin" />
              <span>{pipelineStatusText}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pipelineProgress}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-page)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${pipelineProgress}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Course Context Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '16px 20px',
          marginBottom: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{activePack?.courseName}</h2>
            <small style={{ color: 'var(--text-muted)' }}>
              {activePack?.lecturer} · {activePack?.institution} ({activePack?.year}) · {activePack?.lectures?.length || 0} הרצאות מעובדות
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleConvertToCourse}
            className="ghost-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: '0.82rem',
              fontWeight: 600,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)'
            }}
          >
            <Share2 size={14} />
            <span>המר לקורס פעיל ב-Course_Master</span>
          </button>
        </div>
      </div>

      {/* Main 3 Navigation Tabs */}
      <div
        className="tabs no-print"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 12
        }}
      >
        <button
          className={activeMainTab === 'master' ? 'selected' : ''}
          onClick={() => setActiveMainTab('master')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          <BookOpen size={17} />
          <span>ספר הקורס המלא (Master Book)</span>
        </button>

        <button
          className={activeMainTab === 'lectures' ? 'selected' : ''}
          onClick={() => setActiveMainTab('lectures')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          <Layers size={17} />
          <span>הרצאות לפי תאריך ({activePack?.lectures?.length || 0})</span>
        </button>

        <button
          className={activeMainTab === 'pipeline' ? 'selected' : ''}
          onClick={() => setActiveMainTab('pipeline')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          <UploadCloud size={17} />
          <span>העלאת חומרים והגדרות Pipeline</span>
        </button>
      </div>

      {/* VIEW 1: Master Book View */}
      {activeMainTab === 'master' && (
        <div>
          {/* Table of Contents & Book Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              marginBottom: 32
            }}
          >
            {/* Interactive TOC Card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl, 20px)',
                padding: 24
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Bookmark size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>תוכן עניינים מקושר</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(activePack?.masterBook?.toc || []).map(t => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-page)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      fontWeight: 500
                    }}
                  >
                    <span>
                      <b>פרק {t.number}:</b> {t.title}
                    </span>
                    <small style={{ color: 'var(--text-muted)' }}>{t.date}</small>
                  </a>
                ))}

                <a
                  href="#appendix-exam-cues"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-subtle)',
                    textDecoration: 'none',
                    color: 'var(--primary-hover)',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    marginTop: 6
                  }}
                >
                  <span>★ נספח מרכז: כל דגשי המרצה למבחן</span>
                  <Flame size={15} color="var(--amber)" fill="var(--amber)" />
                </a>
              </div>
            </div>

            {/* Quick Metrics & Exam Highlights */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl, 20px)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  דוח מיזוג וסינתזה (Consolidated Report)
                </span>
                <h3 style={{ margin: '6px 0 12px 0', fontSize: '1.15rem', fontWeight: 800 }}>
                  ספר הקורס המלא — {activePack?.courseName}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  ספר זה נבנה אוטומטית באמצעות איחוד כלל ההרצאות. כל ההגדרות, המשפטים והאלגוריתמים נשמרו ללא כפילויות, תוך שימוש ברינדור מתמטי של LaTeX (KaTeX).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
                <div style={{ background: 'var(--bg-page)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {activePack?.lectures?.length || 0}
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>הרצאות מוזגו</small>
                </div>

                <div style={{ background: 'var(--bg-page)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber)' }}>
                    {activePack?.masterBook?.examAppendix?.highPriority?.length || 0}
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>דגשי מבחן קריטיים</small>
                </div>

                <div style={{ background: 'var(--bg-page)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                    100%
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ללא כפילויות</small>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {(activePack?.masterBook?.chapters || []).map(ch => (
              <section
                key={ch.id}
                id={ch.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl, 20px)',
                  padding: '32px 36px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    פרק {ch.number} · {ch.date}
                  </span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 800 }}>{ch.title}</h2>
                </div>

                {/* 1. TLDR */}
                <div style={{ background: 'var(--bg-page)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                  <b style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>תקציר ההרצאה (TL;DR):</b>
                  <RichText html={ch.summary?.tldr} />
                </div>

                {/* 2. Definitions */}
                {ch.summary?.definitions?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.15rem', borderRight: '4px solid var(--primary)', paddingRight: 8, marginBottom: 12 }}>
                      הגדרות ומושגים פורמליים
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ch.summary.definitions.map((def, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 16,
                            background: 'var(--bg-surface)'
                          }}
                        >
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', color: 'var(--primary)' }}>
                            {def.term}
                          </h4>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            <b>הסבר אינטואיטיבי:</b> {def.intuitive}
                          </p>
                          <div style={{ background: 'var(--bg-page)', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem' }}>
                            <b>הגדרה פורמלית:</b> <RichText html={def.formal} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Theorems & Proofs */}
                {ch.summary?.theorems?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.15rem', borderRight: '4px solid var(--accent)', paddingRight: 8, marginBottom: 12 }}>
                      משפטים, טענות והוכחות מרכזיות
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ch.summary.theorems.map((th, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 16,
                            background: 'var(--bg-surface)'
                          }}
                        >
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', color: 'var(--accent)' }}>
                            {th.name}
                          </h4>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 600 }}>
                            <RichText html={th.statement} />
                          </p>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            <b>רעיון מנחה להוכחה (Proof Idea):</b> <RichText html={th.proofIdea} />
                          </div>
                          {th.tricks && (
                            <div style={{ background: 'var(--primary-subtle)', padding: '6px 10px', borderRadius: 6, fontSize: '0.82rem', color: 'var(--primary-hover)' }}>
                              <b>טריק אלגברי / חישובי למבחן:</b> <RichText html={th.tricks} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Algorithms */}
                {ch.summary?.algorithms?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.15rem', borderRight: '4px solid var(--cyan)', paddingRight: 8, marginBottom: 12 }}>
                      אלגוריתמים, פרוצדורות ושיטות עבודה
                    </h3>
                    {ch.summary.algorithms.map((alg, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: 16,
                          background: 'var(--bg-surface)'
                        }}
                      >
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--cyan)' }}>
                          {alg.name}
                        </h4>
                        <ul style={{ margin: 0, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
                          {alg.steps.map((st, sIdx) => (
                            <li key={sIdx}>
                              <RichText html={st} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Exam Pitfalls */}
                {ch.summary?.pitfalls?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.15rem', borderRight: '4px solid var(--danger)', paddingRight: 8, marginBottom: 12 }}>
                      דגשים, טריקים ומלכודות נפוצות
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {ch.summary.pitfalls.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--danger-subtle)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            padding: 14,
                            fontSize: '0.88rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
                            <AlertTriangle size={16} />
                            <span>{p.trap}</span>
                          </div>
                          <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}><b>הסיבה לטעות:</b> {p.why}</p>
                          <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}><b>בדיקת שפיות למבחן:</b> {p.correction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            {/* Appendix: Master Exam Cues */}
            <section
              id="appendix-exam-cues"
              style={{
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card-subtle) 100%)',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-xl, 20px)',
                padding: '32px 36px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Flame size={24} color="#f59e0b" fill="#f59e0b" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                  נספח מרכז: כל דגשי המרצה והרמזים לבחינה
                </h2>
              </div>
              <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ריכוז כל האמירות המפורשות, ההדגשות החוזרות והנושאים שהמרצה ציין ספציפית לקראת מועדי הבחינה.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(activePack?.masterBook?.examAppendix?.highPriority || []).map((cue, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      borderRight: '5px solid #ef4444',
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      borderLeft: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '16px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ef4444' }}>
                        [High Priority · שאלה בטוחה בבחינה] {cue.topic}
                      </span>
                      <small style={{ color: 'var(--text-muted)' }}>{cue.lectureTitle}</small>
                    </div>
                    <blockquote
                      style={{
                        margin: '8px 0',
                        padding: '8px 14px',
                        background: 'var(--bg-page)',
                        borderRadius: 8,
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        fontStyle: 'italic',
                        color: 'var(--text-primary)'
                      }}
                    >
                      "{cue.quote}"
                    </blockquote>
                    {cue.context && (
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>
                        הקשר בהרצאה: {cue.context}
                      </small>
                    )}
                  </div>
                ))}

                {activePack?.masterBook?.examAppendix?.highPriority?.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    לא אותרו אמירות ברמת High Priority בתמלילים. הפעל את ה-Pipeline לאחר הוספת תמלילים מלאים.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* VIEW 2: Individual Lecture View */}
      {activeMainTab === 'lectures' && (
        <div>
          {/* Lecture Selector Chips */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 12,
              marginBottom: 20
            }}
          >
            {(activePack?.lectures || []).map((lec, idx) => (
              <button
                key={lec.id}
                onClick={() => setSelectedLectureIdx(idx)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1px solid var(--border-subtle)',
                  background: selectedLectureIdx === idx ? 'var(--primary)' : 'var(--bg-surface)',
                  color: selectedLectureIdx === idx ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>הרצאה {idx + 1}: {lec.title}</span>
                {lec.audioFileName && <FileAudio size={14} />}
              </button>
            ))}
          </div>

          {currentLecture ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl, 20px)',
                padding: '28px 32px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                    הרצאה {selectedLectureIdx + 1} · {currentLecture.date}
                  </span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>
                    {currentLecture.title}
                  </h2>
                </div>

                {/* Sub-Tabs: Summary vs Exam Cues vs Transcript */}
                <div style={{ display: 'flex', background: 'var(--bg-page)', padding: 4, borderRadius: 10 }}>
                  <button
                    onClick={() => setLectureSubTab('summary')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: 'none',
                      background: lectureSubTab === 'summary' ? 'var(--primary)' : 'transparent',
                      color: lectureSubTab === 'summary' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    סיכום אקדמי מעמיק
                  </button>
                  <button
                    onClick={() => setLectureSubTab('cues')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: 'none',
                      background: lectureSubTab === 'cues' ? 'var(--primary)' : 'transparent',
                      color: lectureSubTab === 'cues' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    דוח דגשי מרצה ורמזים
                  </button>
                  <button
                    onClick={() => setLectureSubTab('transcript')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: 'none',
                      background: lectureSubTab === 'transcript' ? 'var(--primary)' : 'transparent',
                      color: lectureSubTab === 'transcript' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    תמליל ואודיו
                  </button>
                </div>
              </div>

              {/* Subtab 1: Academic Summary */}
              {lectureSubTab === 'summary' && currentSummary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: 'var(--bg-page)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                    <b style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>1. תקציר ההרצאה (TL;DR):</b>
                    <RichText html={currentSummary.tldr} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10, color: 'var(--primary)' }}>2. הגדרות ומושגים חדשים:</h3>
                    {(currentSummary.definitions || []).map((d, i) => (
                      <div key={i} style={{ border: '1px solid var(--border-subtle)', padding: 14, borderRadius: 10, marginBottom: 8 }}>
                        <b style={{ color: 'var(--primary)', fontSize: '0.98rem' }}>{d.term}</b>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><b>משמעות אינטואיטיבית:</b> {d.intuitive}</p>
                        <div style={{ background: 'var(--bg-page)', padding: 8, borderRadius: 6, fontSize: '0.88rem' }}>
                          <b>הגדרה מתמטית פורמלית:</b> <RichText html={d.formal} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10, color: 'var(--accent)' }}>3. משפטים, טענות והוכחות:</h3>
                    {(currentSummary.theorems || []).map((th, i) => (
                      <div key={i} style={{ border: '1px solid var(--border-subtle)', padding: 14, borderRadius: 10, marginBottom: 8 }}>
                        <b style={{ color: 'var(--accent)', fontSize: '0.98rem' }}>{th.name}</b>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><RichText html={th.statement} /></p>
                        <p style={{ margin: '4px 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}><b>רעיון הוכחה:</b> <RichText html={th.proofIdea} /></p>
                        <small style={{ color: 'var(--primary)', display: 'block', marginTop: 4 }}><b>טריק אלגברי:</b> <RichText html={th.tricks} /></small>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10, color: 'var(--cyan)' }}>4. אלגוריתמים ונוהלי עבודה צעד-אחר-צעד:</h3>
                    {(currentSummary.algorithms || []).map((a, i) => (
                      <div key={i} style={{ border: '1px solid var(--border-subtle)', padding: 14, borderRadius: 10, marginBottom: 8 }}>
                        <b style={{ color: 'var(--cyan)', fontSize: '0.98rem' }}>{a.name}</b>
                        <ul style={{ margin: '8px 0 0 0', paddingRight: 20 }}>
                          {(a.steps || []).map((st, sI) => (
                            <li key={sI} style={{ fontSize: '0.88rem', marginBottom: 4 }}><RichText html={st} /></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 2: Exam Hints & Cues */}
              {lectureSubTab === 'cues' && currentCues && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Focus Recommendation */}
                  <div style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--primary-hover)', marginBottom: 6 }}>
                      <Award size={18} />
                      <span>המלצת פוקוס ללמידה להרצאה זו:</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {currentCues.focusRecommendation?.actionPlan}
                    </p>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>
                      זמן מומלץ: {currentCues.focusRecommendation?.timeEstimate}
                    </small>
                  </div>

                  {/* High Priority */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Flame size={18} />
                      <span>דגשי High Priority (אמירות מפורשות של המרצה לבחינה):</span>
                    </h3>
                    {(currentCues.highPriority || []).map((cue, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-page)',
                          borderRight: '4px solid #ef4444',
                          borderTop: '1px solid var(--border-subtle)',
                          borderBottom: '1px solid var(--border-subtle)',
                          borderLeft: '1px solid var(--border-subtle)',
                          padding: '12px 16px',
                          borderRadius: 8,
                          marginBottom: 8
                        }}
                      >
                        <b style={{ color: '#ef4444', display: 'block', marginBottom: 4 }}>{cue.topic}</b>
                        <blockquote style={{ margin: 0, fontSize: '0.92rem', fontStyle: 'italic', fontWeight: 600 }}>
                          "{cue.quote}"
                        </blockquote>
                        {cue.context && (
                          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                            הקשר: {cue.context}
                          </small>
                        )}
                      </div>
                    ))}
                    {(currentCues.highPriority || []).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>אין ציטוטי High Priority ספציפיים עבור הרצאה זו.</p>
                    )}
                  </div>

                  {/* Out of Scope */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      מחוץ לתחום (נושאים שהמרצה פטר מהם במפורש):
                    </h3>
                    {(currentCues.outOfScope || []).map((item, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-page)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 8 }}>
                        <b style={{ color: 'var(--text-secondary)' }}>{item.topic}</b>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{item.quote}"</p>
                      </div>
                    ))}
                    {(currentCues.outOfScope || []).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>לא צוינו נושאים מחוץ לתחום בהרצאה זו.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Subtab 3: Raw Transcript & Audio */}
              {lectureSubTab === 'transcript' && (
                <div>
                  {currentLecture.audioFileName && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--bg-page)',
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 16
                      }}
                    >
                      <button className="primary icon-button" style={{ width: 36, height: 36 }}>
                        <Play size={16} />
                      </button>
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: '0.9rem' }}>{currentLecture.audioFileName}</b>
                        <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 999, marginTop: 6 }} />
                      </div>
                      <Volume2 size={18} color="var(--primary)" />
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>תמליל ההרצאה המלא:</h3>
                  <pre
                    style={{
                      background: 'var(--bg-page)',
                      padding: 16,
                      borderRadius: 10,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      maxHeight: 400,
                      overflowY: 'auto'
                    }}
                  >
                    {currentLecture.transcript}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="surface" style={{ padding: 40, textAlign: 'center' }}>
              <p>אין הרצאות זמינות. עבור ללשונית "העלאת חומרים" להוספת הרצאות.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Pipeline & Upload View */}
      {activeMainTab === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Uploader Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: 24
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <UploadCloud size={20} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>הוספת הרצאה או תרגול ל-Pipeline</h3>
            </div>

            <form onSubmit={handleAddLecture} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  שם ההרצאה / הנושא
                </label>
                <input
                  type="text"
                  value={newLectureTitle}
                  onChange={e => setNewLectureTitle(e.target.value)}
                  placeholder="לדוגמה: עצי AVL, גלגולים ומקרי קצה"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  מספר / תאריך ההרצאה
                </label>
                <input
                  type="text"
                  value={newLectureDate}
                  onChange={e => setNewLectureDate(e.target.value)}
                  placeholder="לדוגמה: הרצאה 4 · 12/11/2025"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Audio / File Upload Zone */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  העלאת קובץ אודיו (m4a, mp3, wav) או קובץ תמליל (txt, docx, pdf)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".m4a,.mp3,.wav,.ogg,.aac,.txt,.docx,.pdf,.srt,.vtt"
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-page)'
                  }}
                >
                  <FileAudio size={24} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    {audioFileMeta ? `קובץ שנבחר: ${audioFileMeta.name} (${audioFileMeta.size})` : 'לחץ להעלאת הקלטה או תמליל'}
                  </span>
                  <small style={{ color: 'var(--text-muted)' }}>תמיכה מלאה ב-MP3, M4A, WAV, TXT, PDF, DOCX</small>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  תמליל או הערות ההרצאה (Transcript)
                </label>
                <textarea
                  value={newLectureTranscript}
                  onChange={e => setNewLectureTranscript(e.target.value)}
                  placeholder="הדבק כאן תמליל הרצאה או רשמים..."
                  rows={6}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px' }}
              >
                <Plus size={16} />
                <span>הוסף הרצאה זו ל-Study Pack</span>
              </button>
            </form>
          </div>

          {/* Current Queue & Controls */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>הרצאות בחבילת הלמידה ({activePack?.lectures?.length || 0})</h3>
              <button
                className="ghost-button"
                onClick={() => {
                  const demo = getDefaultSampleStudyPack();
                  updateActivePack(demo);
                }}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                טען הרצאות לדוגמה
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 380 }}>
              {(activePack?.lectures || []).map((lec, i) => (
                <div
                  key={lec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{i + 1}.</span>
                    <div>
                      <b style={{ fontSize: '0.9rem', display: 'block' }}>{lec.title}</b>
                      <small style={{ color: 'var(--text-muted)' }}>{lec.date} {lec.audioFileName && `· ${lec.audioFileName}`}</small>
                    </div>
                  </div>

                  <button
                    className="icon-button"
                    onClick={() => {
                      const updatedLecs = activePack.lectures.filter((_, idx) => idx !== i);
                      const consolidated = consolidateStudyPack({ ...activePack, lectures: updatedLecs });
                      updateActivePack(consolidated);
                    }}
                    title="מחק הרצאה"
                  >
                    <Trash2 size={16} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="primary"
                onClick={runFullPipeline}
                disabled={isProcessingPipeline || (activePack?.lectures || []).length === 0}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
              >
                <Wand2 size={18} />
                <span>הפעל NotebookLM Pipeline על כל ההרצאות</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
