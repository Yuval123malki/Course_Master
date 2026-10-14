import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';
import { navigate } from '../utils/dom';

export function CourseEditorPage({ courseId }) {
  const { courses, updateCourse } = useCourse();
  const course = courses.find(c => c.id === courseId) || courses[0];

  const [activeTab, setActiveTab] = useState('info');
  const [courseInfo, setCourseInfo] = useState({ ...(course?.courseData?.COURSE || {}) });
  const [topics, setTopics] = useState([ ...(course?.courseData?.TOPICS || []) ]);
  const [questions, setQuestions] = useState([ ...(course?.courseData?.QUESTIONS || []) ]);
  const [isSaved, setIsSaved] = useState(false);

  // New Topic / Question forms
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicTag, setNewTopicTag] = useState('');
  const [newQuestionTopic, setNewQuestionTopic] = useState(topics[0]?.id || '');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionSol, setNewQuestionSol] = useState('');

  if (!course) {
    return <div className="surface">הקורס לא נמצא. <button onClick={() => navigate('courses')}>חזרה לרשימת הקורסים</button></div>;
  }

  const handleSaveAll = () => {
    const updatedCourseData = {
      ...course.courseData,
      COURSE: courseInfo,
      TOPICS: topics,
      QUESTIONS: questions
    };
    updateCourse(courseId, { courseData: updatedCourseData });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const newTopic = {
      id: `topic-${topics.length + 1}`,
      n: topics.length + 1,
      title: newTopicTitle,
      tag: newTopicTag || newTopicTitle.split(' ')[0],
      prio: 'B',
      syl: `סעיף ${topics.length + 1}: ${newTopicTitle}`,
      srcs: ['הרצאה חדשה'],
      why: 'נושא חשוב שנוסף לתוכנית הלימודים.',
      sec: [
        {
          h: 'מבוא והגדרות',
          html: `<p>תוכן יחידת הלימוד עבור <b>${newTopicTitle}</b>.</p>`
        }
      ]
    };
    setTopics([...topics, newTopic]);
    setNewTopicTitle('');
    setNewTopicTag('');
  };

  const handleDeleteTopic = (idx) => {
    if (window.confirm('האם למחוק פרק זה?')) {
      const updated = topics.filter((_, i) => i !== idx);
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
      type: 'שאלה פתוחה',
      skill: 'תרגול והעמקה',
      origin: 'orig',
      src: 'נוצר ב-CourseForge Studio',
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
        eyebrow={`עריכת תוכן הקורס · ${course.courseData?.COURSE?.name || course.id}`}
        title="ממשק ניהול ועריכת תכנים (CMS)"
        desc="הוסף פרקים, ערוך נוסחאות KaTeX, הוסף שאלות מבחן ועדכן את פתרונות הקורס."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ghost-button" onClick={() => navigate('courses')}>
              <ArrowLeft size={16} /> חזרה לדשבורד הקורסים
            </button>
            <button
              className="primary"
              onClick={handleSaveAll}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: isSaved ? 'var(--green)' : 'var(--blue)' }}
            >
              {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {isSaved ? 'השינויים נשמרו בהצלחה!' : 'שמור שינויים'}
            </button>
          </div>
        }
      />

      <div className="tabs">
        <button className={activeTab === 'info' ? 'selected' : ''} onClick={() => setActiveTab('info')}>
          פרטי הקורס הכלליים
        </button>
        <button className={activeTab === 'topics' ? 'selected' : ''} onClick={() => setActiveTab('topics')}>
          ניהול פרקים ויחידות לימוד ({topics.length})
        </button>
        <button className={activeTab === 'questions' ? 'selected' : ''} onClick={() => setActiveTab('questions')}>
          ניהול בנק שאלות ותרגול ({questions.length})
        </button>
      </div>

      {activeTab === 'info' && (
        <section className="surface" style={{ padding: 22 }}>
          <h2>פרטי הקורס וצוות ההוראה</h2>
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
              נקודות זכות (נ"ז)
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
          <section className="surface" style={{ padding: 20, marginBottom: 20 }}>
            <h3>הוספת פרק לימוד חדש</h3>
            <div className="form-row" style={{ marginTop: 10 }}>
              <label className="grow">
                שם הפרק החדש
                <input
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="לדוגמה: מרחבים וקטוריים, טבלאות אמת, רקורסיה"
                />
              </label>
              <label>
                תגית קצרה
                <input
                  value={newTopicTag}
                  onChange={e => setNewTopicTag(e.target.value)}
                  placeholder="וקטורים"
                />
              </label>
              <div style={{ alignSelf: 'flex-end' }}>
                <button className="primary" onClick={handleAddTopic} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> הוסף פרק
                </button>
              </div>
            </div>
          </section>

          <div className="question-list">
            {topics.map((topic, idx) => (
              <div key={topic.id || idx} className="surface" style={{ padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span className="chapter-number" style={{ width: 28, height: 28, fontSize: '0.85rem' }}>{idx + 1}</span>
                    <h3 style={{ margin: 0 }}>{topic.title}</h3>
                    <Pill tone={topic.prio === 'A' ? 'priority-a' : 'neutral'}>עדיפות {topic.prio}</Pill>
                  </div>
                  <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {topic.syl} · {(topic.sec || []).length} יחידות לימוד
                  </p>
                </div>

                <button className="danger-button" onClick={() => handleDeleteTopic(idx)} title="מחק פרק">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
              גוף השאלה (טקסט, מתמטיקה או קוד):
              <textarea
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                rows={4}
                placeholder="הקלד את שאלת המבחן..."
              />
            </label>

            {newQuestionText && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
                <small style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: 4 }}>תצוגה מקדימה חיה של השאלה (KaTeX):</small>
                <RichText html={newQuestionText} />
              </div>
            )}

            <label className="answer-label" style={{ marginTop: 14 }}>
              פתרון מלא והסבר צעד אחר צעד:
              <textarea
                value={newQuestionSol}
                onChange={e => setNewQuestionSol(e.target.value)}
                rows={4}
                placeholder="הקלד את הפתרון המלא..."
              />
            </label>

            {newQuestionSol && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
                <small style={{ color: 'var(--success)', fontWeight: 700, display: 'block', marginBottom: 4 }}>תצוגה מקדימה חיה של הפתרון:</small>
                <RichText html={newQuestionSol} />
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button className="primary" onClick={handleAddQuestion} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> הוסף שאלה למאגר
              </button>
            </div>
          </section>

          <div className="question-list">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="surface" style={{ padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <Pill tone="priority-a">{q.id}</Pill>
                    <b>{q.skill || q.type}</b>
                    <small style={{ color: 'var(--text-muted)' }}>רמה {q.lvl}</small>
                  </div>
                  <RichText html={q.q} />
                </div>
                <button className="danger-button" onClick={() => handleDeleteQuestion(idx)} title="מחק שאלה">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
