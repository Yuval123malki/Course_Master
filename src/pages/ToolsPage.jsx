import React, { useState } from 'react';
import { Play, Code, CheckCircle, Terminal, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { useCourse } from '../context/CourseStore';
import { PageHead, Pill } from '../components/common/PageHead';
import { RichText } from '../components/common/RichText';

const CODE_PRESETS = [
  {
    name: 'חיפוש בינארי (Binary Search) ב-O(log n)',
    code: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  let steps = 0;

  while (low <= high) {
    steps++;
    const mid = Math.floor((low + high) / 2);
    console.log(\`צעד \${steps}: בודק אינדקס \${mid} (ערך \${arr[mid]})\`);
    if (arr[mid] === target) return { foundIndex: mid, totalSteps: steps };
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return { foundIndex: -1, totalSteps: steps };
}

const data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log("מערך ממוין:", data);
const result = binarySearch(data, 23);
console.log("תוצאה:", result);`
  },
  {
    name: 'אלגוריתם QuickSelect למציאת האיבר ה-k ב-O(n)',
    code: `function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  for (let j = left; j < right; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

function quickSelect(arr, left, right, k) {
  if (left === right) return arr[left];
  const pivotIdx = partition(arr, left, right);
  console.log(\`חלוקה: ציר באינדקס \${pivotIdx}, ערך=\${arr[pivotIdx]}\`);
  if (k === pivotIdx) return arr[k];
  if (k < pivotIdx) return quickSelect(arr, left, pivotIdx - 1, k);
  return quickSelect(arr, pivotIdx + 1, right, k);
}

const nums = [42, 12, 88, 3, 19, 7, 65, 34];
console.log("קלט מקורי:", nums);
const k = 3; // איבר 3 בגודלו (אינדקס 3 מ-0)
const val = quickSelect([...nums], 0, nums.length - 1, k);
console.log(\`האיבר במקום ה-\${k} בסדר ממוין הוא: \${val}\`);`
  },
  {
    name: 'בדיקת תקינות עץ חיפוש בינארי (Validate BST)',
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  console.log(\`בודק צומת \${root.val} בתחום (\${min}, \${max})\`);
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}

// עץ BST תקין:   10
//             /    \\
//            5      15
const root = new TreeNode(10, new TreeNode(5), new TreeNode(15));
console.log("האם העץ הוא BST תקין?", isValidBST(root));`
  }
];

export function ToolsPage() {
  const { activeCourse } = useCourse();
  const CHOOSE = activeCourse?.courseData?.CHOOSE || [];
  const RECOG = activeCourse?.courseData?.RECOG || [];

  const [activeTab, setActiveTab] = useState('choose');
  const [filterQuery, setFilterQuery] = useState('');

  // Code Sandbox State
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [codeContent, setCodeContent] = useState(CODE_PRESETS[0].code);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [execTime, setExecTime] = useState(null);

  const chooseList = (CHOOSE || []).filter(item =>
    !filterQuery || (item.q + ' ' + item.struct + ' ' + item.why).toLowerCase().includes(filterQuery.toLowerCase())
  );

  const recogList = (RECOG || []).filter(item =>
    !filterQuery || (item.clue + ' ' + item.meaning).toLowerCase().includes(filterQuery.toLowerCase())
  );

  const runCode = () => {
    let logs = [];
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args) => {
        logs.push('[WARN] ' + args.join(' '));
      },
      error: (...args) => {
        logs.push('[ERROR] ' + args.join(' '));
      }
    };

    const t0 = performance.now();
    try {
      const runner = new Function('console', codeContent);
      runner(customConsole);
      const t1 = performance.now();
      setExecTime((t1 - t0).toFixed(2));
      setConsoleOutput(logs.join('\n') || 'התוכנית רצה בהצלחה (ללא פלט לקונסול).');
    } catch (err) {
      setConsoleOutput(`שגיאת ריצה: ${err.message}`);
      setExecTime(null);
    }
  };

  return (
    <>
      <PageHead
        eyebrow={activeCourse?.courseData?.COURSE?.name || 'אימון פעיל'}
        title="ארגז כלים, זיהוי רמזים ומעבדת קוד"
        desc="התאמת מבני נתונים לפי דרישות סיבוכיות, פענוח רמזים בשאלות מבחן והרצת קוד חיה."
      />

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'choose' ? 'selected' : ''}
          onClick={() => setActiveTab('choose')}
        >
          בחירת מבנה / שיטה לפי דרישות ({chooseList.length})
        </button>

        <button
          className={activeTab === 'recog' ? 'selected' : ''}
          onClick={() => setActiveTab('recog')}
        >
          רמזים ומילות מפתח במבחן ({recogList.length})
        </button>

        <button
          className={activeTab === 'sandbox' ? 'selected' : ''}
          onClick={() => setActiveTab('sandbox')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Terminal size={16} /> מעבדת אלגוריתמים חיה
        </button>
      </div>

      {activeTab === 'sandbox' ? (
        /* Interactive Code Runner Sandbox */
        <section className="surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={22} color="var(--primary)" />
              <h2 style={{ margin: 0 }}>מעבדת אלגוריתמים וסימולציית קוד חיה</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={selectedPresetIdx}
                onChange={e => {
                  const idx = Number(e.target.value);
                  setSelectedPresetIdx(idx);
                  setCodeContent(CODE_PRESETS[idx].code);
                  setConsoleOutput('');
                  setExecTime(null);
                }}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}
              >
                {CODE_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>{preset.name}</option>
                ))}
              </select>

              <button className="primary" onClick={runCode} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Play size={16} fill="currentColor" /> הרץ קוד
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                עורך קוד JavaScript / אלגוריתם:
              </label>
              <textarea
                value={codeContent}
                onChange={e => setCodeContent(e.target.value)}
                dir="ltr"
                rows={16}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  padding: 16,
                  borderRadius: 12,
                  background: '#0f172a',
                  color: '#e2e8f0',
                  border: '1px solid #1e293b',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  פלט קונסול (Console Output):
                </span>
                {execTime && (
                  <small style={{ color: 'var(--success)', fontWeight: 600 }}>
                    זמן ריצה: {execTime}ms
                  </small>
                )}
              </div>
              <pre
                dir="ltr"
                style={{
                  minHeight: 380,
                  maxHeight: 460,
                  overflowY: 'auto',
                  margin: 0,
                  padding: 16,
                  borderRadius: 12,
                  background: '#090d16',
                  color: '#38bdf8',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  lineHeight: '1.5'
                }}
              >
                {consoleOutput || '// לחץ על "הרץ קוד" להפעלת האלגוריתם והצגת הפלט.'}
              </pre>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Search Filter for Choose / Recog */}
          <div className="surface" style={{ marginBottom: 20 }}>
            <input
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="חפש לפי פעולה, סיבוכיות או מילת מפתח..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
            />
          </div>

          {activeTab === 'choose' ? (
            <div className="question-list">
              {chooseList.map((item, idx) => (
                <div key={idx} className="surface" style={{ padding: 20, marginBottom: 14 }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>{item.q}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <b>המבנה המתאים:</b>
                    <Pill tone="priority-a">{item.struct}</Pill>
                    <span style={{ color: 'var(--text-muted)' }}>זמן פעולה:</span>
                    <code dir="ltr">{item.time}</code>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    <b>הסבר לנימוק במבחן:</b> {item.why}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="question-list">
              {recogList.map((item, idx) => (
                <div key={idx} className="surface" style={{ padding: 20, marginBottom: 14 }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>
                    מילת מפתח / רמז: «{item.clue}»
                  </h3>
                  <p style={{ marginBottom: 8 }}>
                    <b>משמעות ואלגוריתם מומלץ:</b> {item.meaning}
                  </p>
                  <RichText html={item.detail || ''} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
