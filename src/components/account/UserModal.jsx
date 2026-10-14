import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Users,
  Award,
  Target,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  PlusCircle,
  GraduationCap,
  Calculator,
  Clock,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { GradeCalculator } from '../common/GradeCalculator';
import { StudyTimer } from '../common/StudyTimer';

const AVATAR_OPTIONS = ['🎓', '💻', '🧠', '⚡', '🚀', '📚', '🔬', '🎯'];

export function UserModal({ store, close }) {
  const { users, currentUser, activeUserId, switchUser, createUser, updateUser, deleteUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'switch', 'calculator', 'timer', 'data'
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState('🎓');
  const [newTargetGrade, setNewTargetGrade] = useState(90);
  const [newInstitution, setNewInstitution] = useState('');

  const fileInputRef = useRef(null);

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createUser({
      name: newName,
      email: newEmail,
      avatar: newAvatar,
      targetGrade: newTargetGrade,
      institution: newInstitution
    });
    setNewName('');
    setNewEmail('');
    setIsCreatingNew(false);
    setActiveTab('profile');
  };

  const handleExport = () => {
    const dataStr = store.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courseforge-${currentUser.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (content) {
        await store.importFile(content);
        alert('ההתקדמות יובאה בהצלחה עבור ' + currentUser.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך לאפס את כל ההתקדמות של ${currentUser.name}? פעולה זו אינה ניתנת לביטול.`)) {
      await store.clearAll();
      close();
    }
  };

  const solvedCount = Object.keys(store?.progress?.entries || {}).filter(
    k => k.startsWith('question:') && store.progress.entries[k]?.value?.status
  ).length;

  return (
    <div className="search-overlay" onClick={close}>
      <div
        className="search-dialog account-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="ניהול משתמש ופרופיל לימוד"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 760, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="account-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}
            >
              {currentUser.avatar || '🎓'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentUser.name}</h2>
              <small style={{ color: 'var(--text-muted)' }}>
                {currentUser.institution || 'פרופיל סטודנט'} · יעד ציון: {currentUser.targetGrade}
              </small>
            </div>
          </div>

          <button onClick={close} aria-label="סגור" className="ghost-button" style={{ padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs" style={{ margin: '14px 0 18px', borderBottom: '1px solid var(--border)' }}>
          <button
            className={activeTab === 'profile' ? 'selected' : ''}
            onClick={() => setActiveTab('profile')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <User size={16} />
            פרופיל והישגים
          </button>
          <button
            className={activeTab === 'switch' ? 'selected' : ''}
            onClick={() => setActiveTab('switch')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Users size={16} />
            ניהול משתמשים ({users.length})
          </button>
          <button
            className={activeTab === 'calculator' ? 'selected' : ''}
            onClick={() => setActiveTab('calculator')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Calculator size={16} />
            מחשבון ציון סופי
          </button>
          <button
            className={activeTab === 'timer' ? 'selected' : ''}
            onClick={() => setActiveTab('timer')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Clock size={16} />
            טיימר ריכוז
          </button>
          <button
            className={activeTab === 'data' ? 'selected' : ''}
            onClick={() => setActiveTab('data')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={16} />
            גיבוי נתונים
          </button>
        </div>

        {/* Tab 1: Profile & Target */}
        {activeTab === 'profile' && (
          <div className="surface" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                  {solvedCount}
                </span>
                <small style={{ color: 'var(--text-muted)' }}>שאלות נפתרו</small>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Flame size={20} fill="#f59e0b" />
                  {currentUser.studyStreak || 1}
                </span>
                <small style={{ color: 'var(--text-muted)' }}>ימי רצף למידה</small>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)', display: 'block' }}>
                  {currentUser.targetGrade}
                </span>
                <small style={{ color: 'var(--text-muted)' }}>יעד ציון סופי</small>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>עריכת פרטי סטודנט ויעדים</h3>

            {/* Avatar selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.88rem', display: 'block', marginBottom: 6, color: 'var(--text-secondary)' }}>בחר סמל אווטאר:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AVATAR_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateUser(currentUser.id, { avatar: icon })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      border: currentUser.avatar === icon ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: currentUser.avatar === icon ? 'var(--primary-soft)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label className="grow">
                שם מלא
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={e => updateUser(currentUser.id, { name: e.target.value })}
                />
              </label>

              <label className="grow">
                אימייל אקדמי
                <input
                  type="email"
                  value={currentUser.email || ''}
                  onChange={e => updateUser(currentUser.id, { email: e.target.value })}
                  placeholder="student@campus.ac.il"
                />
              </label>
            </div>

            <div className="form-row">
              <label className="grow">
                מוסד אקדמי
                <input
                  type="text"
                  value={currentUser.institution || ''}
                  onChange={e => updateUser(currentUser.id, { institution: e.target.value })}
                  placeholder="הפקולטה למדעי המחשב / המכללה למינהל"
                />
              </label>

              <label>
                יעד ציון סופי ({currentUser.targetGrade})
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={currentUser.targetGrade}
                  onChange={e => updateUser(currentUser.id, { targetGrade: Number(e.target.value) })}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', height: 38 }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: User Switcher & Management */}
        {activeTab === 'switch' && (
          <div className="surface" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>פרופילי סטודנט במכשיר ({users.length})</h3>
                <small style={{ color: 'var(--text-muted)' }}>לכל פרופיל נשמרים ההתקדמות, התשובות והציונים בנפרד</small>
              </div>
              <button
                className="primary"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
              >
                <PlusCircle size={15} />
                <span>{isCreatingNew ? 'סגור טופס' : 'הוסף פרופיל'}</span>
              </button>
            </div>

            {/* Create new user form */}
            {isCreatingNew && (
              <form
                onSubmit={handleCreateUserSubmit}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  marginBottom: 18
                }}
              >
                <h4 style={{ margin: '0 0 12px 0' }}>הוספת פרופיל משתמש חדש</h4>
                <div className="form-row">
                  <label className="grow">
                    שם הסטודנט *
                    <input
                      type="text"
                      required
                      placeholder="שם מלא או כינוי"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                  </label>
                  <label className="grow">
                    אימייל
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="grow">
                    מוסד לימודים
                    <input
                      type="text"
                      placeholder="אוניברסיטה / מכללה"
                      value={newInstitution}
                      onChange={e => setNewInstitution(e.target.value)}
                    />
                  </label>
                  <label>
                    יעד ציון
                    <input
                      type="number"
                      min="60"
                      max="100"
                      value={newTargetGrade}
                      onChange={e => setNewTargetGrade(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button type="button" className="ghost-button" onClick={() => setIsCreatingNew(false)}>
                    ביטול
                  </button>
                  <button type="submit" className="primary">
                    צור פרופיל והתחל ללמוד
                  </button>
                </div>
              </form>
            )}

            {/* Profiles List */}
            <div className="profiles-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map(u => {
                const isActive = u.id === activeUserId;
                return (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--primary-soft)' : 'var(--bg-elevated)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.5rem' }}>{u.avatar || '🎓'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <b style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{u.name}</b>
                          {isActive && (
                            <span className="pill success" style={{ fontSize: '0.72rem' }}>
                              פעיל כעת
                            </span>
                          )}
                        </div>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {u.institution || 'סטודנט'} · יעד ציון: {u.targetGrade}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isActive ? (
                        <button
                          className="primary"
                          onClick={() => switchUser(u.id)}
                          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                        >
                          החלף לפרופיל זה
                        </button>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Check size={16} /> מחובר
                        </span>
                      )}

                      {users.length > 1 && (
                        <button
                          className="ghost-button"
                          onClick={() => {
                            if (window.confirm(`האם למחוק את הפרופיל של ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          style={{ padding: 6, color: 'var(--red)' }}
                          title="מחק פרופיל"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Grade Calculator */}
        {activeTab === 'calculator' && (
          <GradeCalculator />
        )}

        {/* Tab 4: Study Timer */}
        {activeTab === 'timer' && (
          <StudyTimer />
        )}

        {/* Tab 5: Data & Backup */}
        {activeTab === 'data' && (
          <div className="surface" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
              <div>
                <b style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  אחסון מקומי מבודד עבור {currentUser.name}
                </b>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  כל השאלות שפתרת, הסימולציות, המלכודות והסימניות נשמרים בדפדפן שלך.
                </p>
              </div>
            </div>

            <h4 style={{ margin: '18px 0 8px 0' }}>גיבוי ושחזור קבצים</h4>
            <div className="button-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button className="primary" onClick={handleExport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Download size={16} />
                הורד קובץ גיבוי (JSON)
              </button>
              <button onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={16} />
                שחזר מקובץ גיבוי
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleImportFile}
              />
            </div>

            <hr style={{ margin: '20px 0', borderColor: 'var(--border)' }} />

            <h4 style={{ color: 'var(--red)', margin: '0 0 6px 0' }}>איפוס נתונים אישי</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              מחיקת כל נתוני התרגול והתחלת הלמידה מחדש עבור {currentUser.name}.
            </p>
            <button className="danger-button" onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Trash2 size={16} />
              איפוס התקדמות המשתמש
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
