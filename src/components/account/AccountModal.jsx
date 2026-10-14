import React, { useRef } from 'react';
import { X, Download, Upload, Trash2, CheckCircle } from 'lucide-react';

export function AccountModal({ store, close }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = store.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ds-progress-${new Date().toISOString().slice(0, 10)}.json`;
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
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל ההתקדמות שלך? פעולה זו אינה ניתנת לביטול.')) {
      await store.clearAll();
      close();
    }
  };

  return (
    <div className="search-overlay" onClick={close}>
      <div
        className="search-dialog account-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="הגדרות חשבון וסנכרון"
        onClick={e => e.stopPropagation()}
      >
        <div className="account-modal-header">
          <h2>החשבון והנתונים שלי</h2>
          <button onClick={close} aria-label="סגור">
            <X size={20} />
          </button>
        </div>

        <div className="account-modal-body surface">
          <div className="sync-status-box">
            <CheckCircle size={22} className="sync-icon" />
            <div>
              <strong>מצב עבודה מקומי (שמירה במכשיר)</strong>
              <p>כל התשובות, הסימולציות והסימניות נשמרות באופן מאובטח בדפדפן שלך.</p>
            </div>
          </div>

          <h3>גיבוי והעברת נתונים</h3>
          <p>באפשרותך להוריד קובץ גיבוי עם כל ההתקדמות שלך, או לייבא קובץ ממכשיר אחר.</p>

          <div className="button-row">
            <button className="primary" onClick={handleExport}>
              <Download size={18} />
              הורד קובץ גיבוי (JSON)
            </button>

            <button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
              ייבא גיבוי
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportFile}
            />
          </div>

          <hr style={{ margin: '20px 0', borderColor: 'var(--line)' }} />

          <h3>איפוס נתונים</h3>
          <p>מחיקת כל נתוני התרגול והתחלת הלמידה מחדש.</p>
          <button className="danger-button" onClick={handleReset}>
            <Trash2 size={18} />
            איפוס כל ההתקדמות
          </button>
        </div>
      </div>
    </div>
  );
}
