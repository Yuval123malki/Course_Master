import React, { useRef, useState } from 'react';
import { User, Download, Upload, Trash2, Sparkles, Moon, Sun, Check, AlertCircle } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { useTheme } from '../context/ThemeContext';
import { PageHead } from '../components/common/PageHead';
import { navigate } from '../utils/dom';

export function SettingsPage({ store, openAccount }) {
  const { activeCourse } = useCourse();
  const { theme, toggleTheme } = useTheme();
  const info = activeCourse?.courseData?.COURSE || {};

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const dataStr = store.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-${activeCourse.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const success = await store.importFile(evt.target.result);
        if (success) {
          setImportStatus({ type: 'success', msg: 'ההתקדמות יובאה ושוחזרה בהצלחה!' });
        } else {
          setImportStatus({ type: 'error', msg: 'שגיאה בעיבוד קובץ הגיבוי.' });
        }
      } catch (err) {
        setImportStatus({ type: 'error', msg: 'קובץ הגיבוי אינו תקין.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל ההתקדמות בקורס הנוכחי? פעולה זו אינה ניתנת לביטול.')) {
      await store.clearAll();
      setImportStatus({ type: 'success', msg: 'ההתקדמות אופסה לחלוטין.' });
    }
  };

  return (
    <>
      <PageHead
        eyebrow={info.name || 'הגדרות'}
        title="הגדרות וניהול מערכת"
        desc="ההתקדמות נשמרת אוטומטית במכשיר שלך בדפדפן (Local-First). ניתן לייצא גיבויים, לנהל ערכות נושא או לעבור לסטודיו המאסטר."
      />

      {importStatus && (
        <div
          className="surface"
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 'var(--radius-md)',
            border: importStatus.type === 'success' ? '1px solid var(--green)' : '1px solid var(--red)',
            background: importStatus.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {importStatus.type === 'success' ? (
            <Check size={18} style={{ color: 'var(--green)' }} />
          ) : (
            <AlertCircle size={18} style={{ color: 'var(--red)' }} />
          )}
          <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{importStatus.msg}</span>
        </div>
      )}

      <div className="two-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Appearance Settings */}
        <section className="surface" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--primary)' }} /> : <Sun size={20} style={{ color: 'var(--amber)' }} />}
            מראה וערכת נושא
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 16 }}>
            התאם את הממשק להעדפות הלמידה שלך. מצב כהה מותאם לשעות הלילה ומפחית עייפות עיניים, ומצב בהיר מתאים לקריאה באור יום.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`ghost-button ${theme === 'dark' ? 'selected' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
              style={{ flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Moon size={16} />
              מצב כהה (Dark)
            </button>
            <button
              className={`ghost-button ${theme === 'light' ? 'selected' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
              style={{ flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Sun size={16} />
              מצב בהיר (Light)
            </button>
          </div>
        </section>

        {/* Master Studio */}
        <section className="surface" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
            סטודיו המאסטר וקורסים
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 16 }}>
            ניהול כל הקורסים הפעילים, הוספת קורס אקדמי חדש באמצעות האשף החכם, או עריכת התכנים והשאלות של הקורס הנוכחי.
          </p>
          <div className="button-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="primary"
              onClick={() => navigate('courses')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={16} />
              דשבורד כל הקורסים
            </button>
            <button
              className="ghost-button"
              onClick={() => navigate('studio/edit/' + activeCourse.id)}
            >
              ערוך את תכני הקורס
            </button>
          </div>
        </section>

        {/* Backup & Local Data */}
        <section className="surface" style={{ padding: 22, borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            נתוני התקדמות וגיבוי מקומי
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 16 }}>
            כל השאלות שפתרת, הסימולציות, המלכודות והסימניות נשמרים בדפדפן שלך. מומלץ להוריד קובץ גיבוי תקופתי.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />

          <div className="button-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="ghost-button"
              onClick={openAccount}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <User size={16} />
              ניהול נתונים וסנכרון
            </button>
            <button
              className="ghost-button"
              onClick={handleExport}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={16} />
              הורד קובץ גיבוי (JSON)
            </button>
            <button
              className="ghost-button"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={16} />
              ייבא ושחזר גיבוי
            </button>
            <button
              className="danger-button"
              onClick={handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={16} />
              איפוס התקדמות
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

