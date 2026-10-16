import React, { useState, useRef } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  UploadCloud,
  FolderGit2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { parseRepositoryFile } from '../utils/fileExtractor';
import { compileCourseFromSources } from '../components/studio/CourseCompiler';
import { navigate } from '../utils/dom';

export function CourseEditorPage({ courseId }) {
  const { courses, updateCourse } = useCourse();
  const course = courses.find(c => c.id === courseId) || courses[0];
  const repoInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('repo');
  const [courseInfo, setCourseInfo] = useState({ ...(course?.courseData?.COURSE || {}) });
  const [topics, setTopics] = useState([ ...(course?.courseData?.TOPICS || []) ]);
  const [questions, setQuestions] = useState([ ...(course?.courseData?.QUESTIONS || []) ]);
  const [inventory, setInventory] = useState([ ...(course?.inventoryData || []) ]);
  const [expandedTopicIdx, setExpandedTopicIdx] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // New Topic / Question forms
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicTag, setNewTopicTag] = useState('');
  const [newQuestionTopic, setNewQuestionTopic] = useState(topics[0]?.id || '');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionSol, setNewQuestionSol] = useState('');

  if (!course) {
    return (
      <div className="surface">
        הקורס לא נמצא. <button className="text-link" onClick={() => navigate('courses')}>חזרה לספריית הקורסים</button>
      </div>
    );
  }

  const handleSaveAll = () => {
    const updatedCourseData = {
      ...course.courseData,
      COURSE: courseInfo,
      TOPICS: topics,
      QUESTIONS: questions
    };
    updateCourse(courseId, {
      courseData: updatedCourseData,
      inventoryData: inventory
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Add new files directly into this course's repository and synthesize new questions/notes
  const handleAddFilesToCourseRepo = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const parsedRepoFiles = [];
    for (const file of files) {
      const item = await parseRepositoryFile(file, null);
      parsedRepoFiles.push(item);
    }

    // Re-compile supplementary questions/topics from the newly uploaded files
    const synthesized = compileCourseFromSources({
      title: courseInfo.name || course.id,
      code: courseInfo.code || '',
      institution: courseInfo.inst || '',
      category: course.category || 'cs',
      customTopicsList: topics.map(t => t.title),
      repositoryFiles: parsedRepoFiles
    });

    // Append new inventory records
    const nextInventory = [
      ...(synthesized.inventoryData || []),
      ...inventory
    ];
    setInventory(nextInventory);

    // If exam files were uploaded, append the newly extracted exam questions
    const hasExamFiles = parsedRepoFiles.some(f => f.category === 'exam');
    if (hasExamFiles && synthesized.courseData?.QUESTIONS?.length > 0) {
      const newQuestions = synthesized.courseData.QUESTIONS.map((q, idx) => ({
        ...q,
        id: `Q-${String(questions.length + idx + 1).padStart(2, '0')}`
      }));
      setQuestions(prev => [...newQuestions, ...prev]);
    }

    // If summary files were uploaded, append their content to matching chapters
    const summaryFiles = parsedRepoFiles.filter(f => f.category === 'summary');
    if (summaryFiles.length > 0) {
      setTopics(prev =>
        prev.map((t, idx) => {
          const sf = summaryFiles[idx % summaryFiles.length];
          if (!sf || !sf.content) return t;
          return {
            ...t,
            sec: [
              ...(t.sec || []),
              {
                h: `סיכום: ${sf.name.replace(/\.[^/.]+$/, '')}`,
                html: sf.content
                  .split('\n')
                  .map(l => l.trim())
                  .filter(Boolean)
                  .map(l => `<p>${l}</p>`)
                  .join('')
              }
            ]
          };
        })
      );
    }

    e.target.value = '';
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const newTopic = {
      id: `topic-${Date.now().toString().slice(-4)}`,
      n: topics.length + 1,
      title: newTopicTitle.trim(),
      tag: newTopicTag.trim() || newTopicTitle.trim().split(' ')[0],
      prio: 'B',
      syl: `פרק ${topics.length + 1}: ${newTopicTitle.trim()}`,
      srcs: [`הרצאה ${topics.length + 1}`],
      why: 'נושא ליבה בקורס.',
      sec: [
        {
          h: `מבוא והגדרות — ${newTopicTitle.trim()}`,
          html: `<p>תוכן יחידת הלימוד עבור <b>${newTopicTitle.trim()}</b>.</p>`
        }
      ]
    };
    setTopics([...topics, newTopic]);
    setNewTopicTitle('');
    setNewTopicTag('');
  };

  const handleUpdateTopicField = (idx, field, val) => {
    setTopics(prev => prev.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };

  const handleUpdateSection = (topicIdx, secIdx, field, val) => {
    setTopics(prev =>
      prev.map((t, i) => {
        if (i !== topicIdx) return t;
        const nextSecs = (t.sec || []).map((s, si) => (si === secIdx ? { ...s, [field]: val } : s));
        return { ...t, sec: nextSecs };
      })
    );
  };

  const handleAddSection = (topicIdx) => {
    setTopics(prev =>
      prev.map((t, i) => {
        if (i !== topicIdx) return t;
        const nextSecs = [
          ...(t.sec || []),
          { h: `יחידה ${(t.sec || []).length + 1}`, html: '<p>הקלד תוכן לימודי או נוסחאות כאן...</p>' }
        ];
        return { ...t, sec: nextSecs };
      })
    );
  };

  const handleDeleteTopic = (idx) => {
    if (window.confirm('האם למחוק פרק זה?')) {
      const updated = topics.filter((_, i) => i !== idx).map((t, i) => ({ ...t, n: i + 1 }));
      setTopics(updated);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !newQuestionSol.trim()) {
      alert('נא למלא את גוף השאלה ואת הפתרון!');
      return;
    }
    const newQ = {
      id: `Q-${String(questions.length + 1).padStart(2, '0')}`,
      topic: newQuestionTopic || topics[0]?.id || 'topic-1',
      lvl: 2,
      type: 'שאלת תרגול',
      skill: 'תרגול והעמקה',
      origin: 'orig',
      src: 'נוסף בעורך הקורס',
      q: newQuestionText,
      hints: ['קראו בעיון את הנתונים ונסחו את שלבי הפתרון.'],
      sol: `<p>${newQuestionSol}</p>`,
      check: 'בדקו האם כיסיתם את כל מקרי הקצה.',
      mistake: 'הימנעו מהנחת מסקנות ללא נימוק פורמלי.',
      rubric: 'דיוק בפתרון והנמקה מתמטית מלאה.'
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionText('');
    setNewQuestionSol('');
  };

  const handleDeleteQuestion = (idx) => {
    if (window.confirm('האם למחוק שאלה זו?')) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  return (
    <>
      <PageHead
        eyebrow={`מאגר ועריכת קורס · ${courseInfo.name || course.id}`}
        title="ניהול מאגר הקבצים ותכני הקורס"
        desc="הוסף למאגר מבחני עבר חדשים, סיכומים או סילבוס, וערוך את הפרקים והשאלות שנוצרו."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ghost-button" onClick={() => navigate('courses')}>
              <span>ספריית הקורסים</span>
            </button>
            <button
              className="primary"
              onClick={handleSaveAll}
              style={{ background: isSaved ? 'var(--success)' : undefined }}
            >
              {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              <span>{isSaved ? 'נשמר!' : 'שמור שינויים'}</span>
            </button>
          </div>
        }
      />

      <div className="hub-tabs-bar">
        <button className={`hub-tab-btn ${activeTab === 'repo' ? 'active' : ''}`} onClick={() => setActiveTab('repo')}>
          <FolderGit2 size={15} />
          <span>מאגר קובצי הקורס ({inventory.length})</span>
        </button>
        <button className={`hub-tab-btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
          <span>פרקים ותוכן ({topics.length})</span>
        </button>
        <button className={`hub-tab-btn ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          <span>בנק שאלות ({questions.length})</span>
        </button>
        <button className={`hub-tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <span>פרטי הקורס</span>
        </button>
      </div>

      {activeTab === 'repo' && (
        <>
          <section
            className="surface"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              padding: 20
            }}
          >
            <div>
              <h2 style={{ margin: '0 0 4px' }}>הוספת קבצים חדשים למאגר הקורס</h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                העלה מבחני עבר נוספים (`.docx`, `.pdf`, `.txt`), סיכומי הרצאות או דפי נוסחאות — המערכת תחלץ מהם שאלות ויחידות לימוד חדשות אוטומטית.
              </p>
            </div>

            <input
              ref={repoInputRef}
              type="file"
              multiple
              accept=".docx,.pdf,.txt,.md,.tex,.json,.csv"
              style={{ display: 'none' }}
              onChange={handleAddFilesToCourseRepo}
            />
            <button className="primary" onClick={() => repoInputRef.current?.click()}>
              <UploadCloud size={16} />
              <span>העלה קבצים למאגר ועדכן קורס</span>
            </button>
          </section>

          <div className="question-list">
            {inventory.length === 0 ? (
              <div className="surface empty-state">
                טרם צורפו קובצי מקור למאגר זה. לחץ על &quot;העלה קבצים למאגר&quot; למעלה.
              </div>
            ) : (
              inventory.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="surface"
                  style={{
                    padding: '14px 18px',
                    marginBottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <FileText size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: '0.9rem' }}>{file.filename}</b>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                        {file.path} {file.size ? `· ${file.size}` : ''}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill tone="priority-a">{file.classification || 'קובץ מקור'}</Pill>
                    <button
                      className="danger-button"
                      onClick={() => setInventory(prev => prev.filter((_, i) => i !== idx))}
                      style={{ padding: '6px 9px' }}
                      title="הסר קובץ מהמאגר"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'info' && (
        <section className="surface">
          <h2>פרטי הקורס הכלליים</h2>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label className="grow">
              שם הקורס
              <input
                value={courseInfo.name || ''}
                onChange={e => setCourseInfo({ ...courseInfo, name: e.target.value })}
              />
            </label>
            <label>
              קוד קורס
              <input
                value={courseInfo.code || ''}
                onChange={e => setCourseInfo({ ...courseInfo, code: e.target.value })}
              />
            </label>
            <label className="grow">
              מוסד אקדמי
              <input
                value={courseInfo.inst || ''}
                onChange={e => setCourseInfo({ ...courseInfo, inst: e.target.value })}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="grow">
              מרצים
              <input
                value={courseInfo.lecturers || ''}
                onChange={e => setCourseInfo({ ...courseInfo, lecturers: e.target.value })}
              />
            </label>
            <label className="grow">
              מתרגלים
              <input
                value={courseInfo.tutors || ''}
                onChange={e => setCourseInfo({ ...courseInfo, tutors: e.target.value })}
              />
            </label>
            <label>
              נקודות זכות
              <input
                value={courseInfo.credits || ''}
                onChange={e => setCourseInfo({ ...courseInfo, credits: e.target.value })}
              />
            </label>
          </div>
        </section>
      )}

      {activeTab === 'topics' && (
        <>
          <section className="surface" style={{ padding: 18, marginBottom: 18 }}>
            <div className="form-row" style={{ margin: 0 }}>
              <label className="grow">
                הוספת פרק לימוד חדש
                <input
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                  placeholder="הקלד את שם הפרק החדש..."
                />
              </label>
              <label style={{ width: 160 }}>
                תגית קצרה
                <input
                  value={newTopicTag}
                  onChange={e => setNewTopicTag(e.target.value)}
                  placeholder="לדוגמה: גרפים"
                />
              </label>
              <button className="primary" onClick={handleAddTopic} style={{ height: 38 }}>
                <Plus size={16} />
                <span>הוסף פרק</span>
              </button>
            </div>
          </section>

          <div className="question-list">
            {topics.map((topic, idx) => {
              const isExpanded = expandedTopicIdx === idx;
              return (
                <div key={topic.id || idx} className="surface" style={{ padding: 16, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                      <span className="chapter-number" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                        {idx + 1}
                      </span>
                      <input
                        value={topic.title}
                        onChange={e => handleUpdateTopicField(idx, 'title', e.target.value)}
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          fontSize: '1rem',
                          border: '1px solid transparent',
                          background: 'transparent',
                          padding: '4px 8px',
                          borderRadius: 6
                        }}
                      />
                      <select
                        value={topic.prio || 'B'}
                        onChange={e => handleUpdateTopicField(idx, 'prio', e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-page)', fontSize: '0.78rem' }}
                      >
                        <option value="A">עדיפות A</option>
                        <option value="B">עדיפות B</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="ghost-button"
                        onClick={() => setExpandedTopicIdx(isExpanded ? null : idx)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={13} />
                        <span>{isExpanded ? 'סגור תוכן' : `ערוך יחידות (${(topic.sec || []).length})`}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button className="danger-button" onClick={() => handleDeleteTopic(idx)} title="מחק פרק" style={{ padding: '6px 9px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(topic.sec || []).map((sec, sIdx) => (
                        <div key={sIdx} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                          <input
                            value={sec.h}
                            onChange={e => handleUpdateSection(idx, sIdx, 'h', e.target.value)}
                            placeholder="כותרת היחידה"
                            style={{ width: '100%', fontWeight: 650, marginBottom: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                          />
                          <textarea
                            value={sec.html}
                            onChange={e => handleUpdateSection(idx, sIdx, 'html', e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.85rem' }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleAddSection(idx)}
                        style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> הוסף יחידת תוכן לפרק זה
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'questions' && (
        <>
          <section className="surface" style={{ padding: 20, marginBottom: 20 }}>
            <h3>הוספת שאלת תרגול חדשה</h3>
            <div className="form-row" style={{ marginTop: 10 }}>
              <label>
                שיוך לפרק
                <select value={newQuestionTopic} onChange={e => setNewQuestionTopic(e.target.value)}>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="answer-label" style={{ marginTop: 10 }}>
              גוף השאלה (תומך בטקסט ונוסחאות KaTeX):
              <textarea
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                rows={3}
                placeholder="הקלד את שאלת המבחן..."
              />
            </label>

            <label className="answer-label" style={{ marginTop: 12 }}>
              פתרון מלא והסבר:
              <textarea
                value={newQuestionSol}
                onChange={e => setNewQuestionSol(e.target.value)}
                rows={3}
                placeholder="הקלד את הפתרון המלא..."
              />
            </label>

            <button className="primary" onClick={handleAddQuestion}>
              <Plus size={16} /> הוסף שאלה למאגר
            </button>
          </section>

          <div className="question-list">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="surface" style={{ padding: 16, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <Pill tone="priority-a">{q.id}</Pill>
                    <b>{q.skill || q.type}</b>
                    <small style={{ color: 'var(--text-muted)' }}>מקור: {q.src}</small>
                  </div>
                  <RichText html={q.q} />
                </div>
                <button className="danger-button" onClick={() => handleDeleteQuestion(idx)} title="מחק שאלה">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
