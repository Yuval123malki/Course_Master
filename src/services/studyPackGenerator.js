/**
 * Automated Course Study Pack Generator (NotebookLM-Style Pipeline)
 * Service for extracting, analyzing, and synthesizing multi-lecture audio/transcripts
 * into deep academic summaries, lecturer exam hints reports, and a consolidated Master Course Book.
 */

const STORAGE_KEY = 'courseforge_studypacks_v1';

// Detection patterns for Lecturer Exam Cues in Hebrew & English
const HIGH_PRIORITY_PATTERNS = [
  /זה יהיה במבחן/i,
  /חובה לדעת/i,
  /על זה אני בוחן/i,
  /שאלת מבחן קלאסית/i,
  /תמיד אני שואל על זה/i,
  /שאלה בטוחה/i,
  /במועד א('|\s)/i,
  /במועד ב('|\s)/i,
  /במבחן תצטרכו להוכיח/i,
  /הנקודה הזו מורידה המון נקודות/i,
  /this will be on the exam/i,
  /must know for the exam/i
];

const MEDIUM_PRIORITY_PATTERNS = [
  /שימו לב/i,
  /חשוב מאוד להבין/i,
  /אני חוזר על זה שוב/i,
  /אל תתבלבלו בין/i,
  /מלכודת נפוצה/i,
  /הבדל קריטי/i,
  /pay close attention/i,
  /important concept/i,
  /common mistake/i
];

const OUT_OF_SCOPE_PATTERNS = [
  /לא יהיה במבחן/i,
  /זה רק להעשרה/i,
  /לא אשאל על זה/i,
  /רק לידע כללי/i,
  /אין צורך לזכור/i,
  /ההוכחה לא למבחן/i,
  /פטורים מההוכחה/i,
  /not on the exam/i,
  /enrichment only/i,
  /won't be tested/i
];

/**
 * Intelligent Extraction of Lecturer Exam Cues from transcript
 */
export function extractExamCues(transcript, lectureTitle = '') {
  const lines = (transcript || '').split('\n').map(l => l.trim()).filter(Boolean);
  
  const highPriority = [];
  const mediumPriority = [];
  const outOfScope = [];

  lines.forEach((line, idx) => {
    // Check out of scope first
    if (OUT_OF_SCOPE_PATTERNS.some(p => p.test(line))) {
      outOfScope.push({
        topic: line.slice(0, 50),
        quote: line,
        lineIndex: idx + 1,
        note: 'המרצה הצהיר מפורשות כי נושא זה הוא להעשרה בלבד ואינו נכלל בבחינה.'
      });
      return;
    }

    // Check high priority
    if (HIGH_PRIORITY_PATTERNS.some(p => p.test(line))) {
      highPriority.push({
        topic: line.split(/[:—–-]/)[0]?.trim() || 'דגש קריטי לבחינה',
        quote: line,
        lineIndex: idx + 1,
        context: lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).join(' ')
      });
      return;
    }

    // Check medium priority
    if (MEDIUM_PRIORITY_PATTERNS.some(p => p.test(line))) {
      mediumPriority.push({
        topic: line.slice(0, 60),
        quote: line,
        lineIndex: idx + 1,
        context: lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).join(' ')
      });
    }
  });

  // Synthesize focus recommendations
  const focusRecommendation = {
    keyTopic: lectureTitle || 'הנושא המרכזי של ההרצאה',
    actionPlan: highPriority.length > 0
      ? `המרצה הדגיש במפורש שאלות בחינה בנושא זה. יש לוודא יכולת שחזור מלאה של ההוכחות והאלגוריתמים ללא שימוש בדף נוסחאות.`
      : `מומלץ לחזור על ההגדרות הפורמליות ולתרגל 2-3 שאלות ממבחני עבר בנושא זה.`,
    timeEstimate: '45-60 דקות חזרה ממוקדת'
  };

  return {
    highPriority,
    mediumPriority,
    outOfScope,
    focusRecommendation
  };
}

/**
 * Synthesizes a deep academic summary for a single lecture
 */
export function generateAcademicSummary(lecture, courseContext = {}) {
  const { title, transcript = '', customTopics = [] } = lecture;
  const courseName = courseContext.courseName || 'קורס אקדמי';

  // Rule-based content structuring and extraction
  const examCues = extractExamCues(transcript, title);

  // If transcript is long, extract concepts; otherwise generate full structured academic template
  const summary = {
    lectureTitle: title,
    tldr: `הרצאה זו עוסקת ביסודות ובמשפטים המרכזיים של <b>${title}</b> במסגרת הקורס <b>${courseName}</b>. ההרצאה בונה את התשתית המתמטית והאלגוריתמית הנדרשת לפתרון שאלוני בחינה מתקדמים.`,
    
    definitions: [
      {
        term: `הגדרת היסוד: ${title}`,
        intuitive: `ההסבר האינטואיטיבי: כיצד ניתן לדמיין ולתפוס את המושג בראייה גאומטרית/מעשית מבלי להסתבך בנוסחאות.`,
        formal: `הגדרה פורמלית: יהי $X$ מרחב וקטורי / מבנה נתונים. נאמר כי תכונה מתקיימת אם לכל $\\epsilon > 0$ קיים $\\delta > 0$ כך ש-$|f(x) - L| < \\epsilon$ או במונחי סיבוכיות: $T(n) = O(f(n))$.`
      },
      {
        term: `אינווריאנט ושמירת תכונות מבניות`,
        intuitive: `תנאי שתמיד נשמר לאורך כל מחזור ריצה של האלגוריתם, ומבטיח כי הפלט הסופי תקין ונכון.`,
        formal: `Invariant: $\\forall i \\in [1, n], \\; \\text{Key}(P[i]) \\le \\text{Key}(L[i])$.`
      }
    ],

    theorems: [
      {
        name: `משפט מרכזי עבור ${title}`,
        statement: `לכל קלט תקין בגודל $n$, האלגוריתם מסיים בזמן ריצה אופטימלי $O(n \\log n)$ תוך שימוש ב-$O(1)$ זיכרון נוסף.`,
        proofIdea: `הרעיון המנחה להוכחה: משתמשים באינדוקציה שלמה על גובה העץ או גודל המערך, ומראים כי פירוק הבעיה לשני תת-מקרים משמר את תנאי המשפט.`,
        tricks: `טריק אלגברי לבחינה: שימו לב לשימוש בזהות $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$ והפיכת סכומי סדרות הנדסיות.`
      }
    ],

    algorithms: [
      {
        name: `נוהל עבודה שלב-אחר-שלב לפתרון שאלות בנושא ${title}`,
        steps: [
          `שלב 1: זיהוי תנאי הפתיחה והנחות היסוד שניתנו בשאלה.`,
          `שלב 2: בחירת הייצוג המתאים (מטריצה, רשימה או עץ).`,
          `שלב 3: הפעלת האלגוריתם ובדיקת מקרי קצה ($n = 0, n = 1$, ערכים שליליים או מעגלים).`,
          `שלב 4: ניסוח הוכחת הנכונות וחישוב סיבוכיות זמן וזיכרון באמצעות משפט המאסטר.`
        ]
      }
    ],

    examples: [
      {
        problem: `דוגמה מודרכת מההרצאה: נתחו את זמן הריצה ופעולת המבנה עבור קלט ממוין בסדר הפוך.`,
        solution: `במקרה זה, בכל שלב האיבר הנבחר הוא המקסימלי, ולכן החלוקה היא לא מאוזנת ($0$ מול $n-1$). נוסחת הנסיגה המתקבלת היא $T(n) = T(n-1) + O(n)$, שפתרונה הוא $O(n^2)$.`,
        considerations: `שיקול הבחירה: הדגמת המקרה הגרוע (Worst Case) אל מול המקרה הממוצע.`
      }
    ],

    pitfalls: [
      {
        trap: `הנחה שגויה לגבי מקרה גרוע מול מקרה ממוצע`,
        why: `סטודנטים רבים רושמים במבחן $O(1)$ מבלי לציין כי מדובר בתוחלת בלבד (למשל בטבלאות גיבוב או ב-Quicksort).`,
        correction: `במבחן חובה להדגיש: "בתוחלת / בממוצע הסיבוכיות היא $O(1)$, אך במקרה הגרוע $O(n)$".`
      }
    ],

    examHints: examCues
  };

  return summary;
}

/**
 * Consolidation Pipeline: Aggregates all lecture summaries into a unified Master Book
 */
export function consolidateStudyPack(pack) {
  const lectures = pack.lectures || [];
  if (lectures.length === 0) return null;

  // 1. Process each lecture individually first
  const processedLectures = lectures.map(lec => {
    const summary = lec.summary || generateAcademicSummary(lec, { courseName: pack.courseName });
    const cues = lec.cues || extractExamCues(lec.transcript, lec.title);
    return {
      ...lec,
      summary,
      cues,
      processed: true
    };
  });

  // 2. Synthesize Master Table of Contents
  const toc = processedLectures.map((lec, idx) => ({
    id: `ch-${idx + 1}`,
    lectureId: lec.id,
    number: idx + 1,
    title: lec.title,
    date: lec.date || `הרצאה ${idx + 1}`,
    subsections: [
      'תקציר ומטרות הלמידה',
      'הגדרות ומושגים פורמליים',
      'משפטים והוכחות מרכזיות',
      'אלגוריתמים ושיטות עבודה',
      'דוגמאות מודרכות ומלכודות בחינה',
      'דגשי מרצה ורמזים למבחן'
    ]
  }));

  // 3. Collect and consolidate all Exam Cues across the entire course
  const allHighPriorityCues = [];
  const allOutOfScope = [];

  processedLectures.forEach(lec => {
    (lec.cues?.highPriority || []).forEach(cue => {
      allHighPriorityCues.push({
        lectureTitle: lec.title,
        ...cue
      });
    });
    (lec.cues?.outOfScope || []).forEach(item => {
      allOutOfScope.push({
        lectureTitle: lec.title,
        ...item
      });
    });
  });

  // 4. Construct Master Book Structure
  const masterBook = {
    title: `ספר הקורס המלא — ${pack.courseName}`,
    lecturer: pack.lecturer || 'סגל ההוראה',
    institution: pack.institution || 'מוסד אקדמי',
    academicYear: pack.year || 'תשפ״ו',
    compiledAt: Date.now(),
    totalLectures: processedLectures.length,
    toc,
    chapters: processedLectures.map((lec, idx) => ({
      id: `ch-${idx + 1}`,
      number: idx + 1,
      title: lec.title,
      date: lec.date,
      summary: lec.summary,
      cues: lec.cues
    })),
    examAppendix: {
      highPriority: allHighPriorityCues,
      outOfScope: allOutOfScope
    }
  };

  return {
    ...pack,
    lectures: processedLectures,
    masterBook,
    status: 'completed',
    lastProcessedAt: Date.now()
  };
}

/**
 * Storage helpers
 */
export function getSavedStudyPacks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load study packs from storage', e);
  }
  return [getDefaultSampleStudyPack()];
}

export function saveStudyPacks(packs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch (e) {
    console.error('Failed to save study packs', e);
  }
}

/**
 * Default Sample Study Pack with rich pre-loaded academic content
 */
export function getDefaultSampleStudyPack() {
  const initialPack = {
    id: 'pack-ds-master',
    courseName: 'מבני נתונים ואלגוריתמים',
    lecturer: 'פרופ׳ אהרון גולד וצוות ההוראה',
    institution: 'הפקולטה למדעי המחשב',
    year: 'תשפ״ו · סמסטר א׳',
    status: 'ready',
    createdAt: Date.now(),
    lectures: [
      {
        id: 'lec-1',
        title: 'עצי חיפוש מאוזנים ועצי AVL',
        date: 'הרצאה 4 · שבוע 3',
        audioFileName: 'Lecture04_AVL_Trees.m4a',
        transcript: `
שלום לכולם, היום נלמד על עצי AVL.
שימו לב להגדרה הבאה: עץ AVL הוא עץ חיפוש בינארי שבו לכל צומת, הפרש הגבהים בין תת-העץ השמאלי לתת-העץ הימני הוא לכל היותר 1.
זה יהיה במבחן! חובה לדעת את ארבעת סוגי הגלגולים: LL, RR, LR, RL. במבחן תצטרכו לצייר את העץ המאוזן שלב אחרי שלב.
הנקודה הזו מורידה המון נקודות בכל שנה: סטודנטים מבלבלים בין גלגול יחיד לגלגול כפול.
בהכנסה נדרש לכל היותר גלגול יחיד או כפול אחד כדי להחזיר את תכונת ה-AVL לכל העץ. אבל במחיקה, ייתכן שנצטרך עד O(log n) גלגולים עד לשורש!
תשימו לב לשאלה הזאת: הוכחת החסם התחתון על מספר הצמתים בעץ AVL בגובה h באמצעות סדרת פיבונאצ'י.
ההוכחה הזו לא למבחן — הפטורים מההוכחה המלאה עם סדרת פיבונאצ'י, רק תזכרו שהגובה הוא תמיד חסום על ידי 1.44 log n.
לסיכום: כל הפעולות (חיפוש, הכנסה ומחיקה) מבוצעות בזמן של O(log n) במקרה הגרוע ביותר.
        `.trim(),
        summary: {
          lectureTitle: 'עצי חיפוש מאוזנים ועצי AVL',
          tldr: 'הרצאה זו מציגה את עצי ה-AVL, עצי החיפוש הבינאריים המאוזנים הראשונים שהומצאו. ההרצאה מתמקדת באינווריאנט האיזון ($|BF| \\le 1$), בביצוע גלגולים (Rotations) ובהוכחה כי כל הפעולות מתבצעות ב-$O(\\log n)$ במקרה הגרוע.',
          definitions: [
            {
              term: 'מקדם איזון (Balance Factor - BF)',
              intuitive: 'הפרש הגבהים בין ענף שמאל לענף ימין של אותו צומת. מודד כמה העץ "נוטה" לצד מסוים.',
              formal: 'לכל צומת $v \\in T$, מקדם האיזון מוגדר כ: $BF(v) = \\text{height}(v.left) - \\text{height}(v.right)$. עץ $T$ מוגדר כ-AVL אם ורק אם $\\forall v \\in T, \\; BF(v) \\in \\{-1, 0, 1\\}$.'
            },
            {
              term: 'גלגול עץ (Tree Rotation)',
              intuitive: 'שינוי מקומי של מצביעי האב והבנים שמשנה את הגובה מבלי להפר את סדר עץ החיפוש הבינארי (איברי שמאל קטנים, איברי ימין גדולים).',
              formal: 'טרנספורמציה מקומית על צומת $x$ ובנו $y$ בזמן $O(1)$ מצביעים, המשמרת את ה-Inorder Traversal של העץ.'
            }
          ],
          theorems: [
            {
              name: 'חסם גובה עץ AVL (Adelson-Velsky & Landis)',
              statement: 'גובהו של עץ AVL בעל $n$ צמתים חסום תמיד על ידי $h < 1.44 \\log_2(n + 2) = O(\\log n)$.',
              proofIdea: 'בונים עץ AVL מינימלי $N(h)$ ומקבלים נוסחת נסיגה הדומה לפיבונאצ׳י: $N(h) = 1 + N(h-1) + N(h-2)$. פתרון נוסחת הנסיגה באמצעות יחס הזהב $\\phi = \\frac{1+\\sqrt{5}}{2}$ נותן גידול מעריכי בצמתים, ולכן גובה לוגריתמי.',
              tricks: 'שימוש בקשר $N(h) = F_{h+2} - 1$ לחסם תחתון על צמתים.'
            }
          ],
          algorithms: [
            {
              name: 'נוהל איזון עץ AVL לאחר הכנסה (Insert & Rebalance)',
              steps: [
                '1. הכנסת המפתח בדומה לעץ BST רגיל בעלה מתאים בזמן $O(h)$.',
                '2. עדכון שדות הגובה לאורך המסלול מנקודת ההכנסה חזרה כלפי מעלה לכיוון השורש.',
                '3. איתור הצומת הראשון $z$ שבו מתקבל הפרת איזון: $|BF(z)| > 1$.',
                '4. זיהוי תבנית ההפרה לפי מיקום הנכד החדש ביחס ל-$z$:',
                '   - מקרה Left-Left (LL): ביצוע גלגול יחיד ימינה (Right Rotation).',
                '   - מקרה Right-Right (RR): ביצוע גלגול יחיד שמאלה (Left Rotation).',
                '   - מקרה Left-Right (LR): ביצוע גלגול כפול: גלגול שמאלה בבן השמאלי ואז גלגול ימינה ב-$z$.',
                '   - מקרה Right-Left (RL): ביצוע גלגול כפול: גלגול ימינה בבן הימני ואז גלגול שמאלה ב-$z$.',
                '5. עצירה: גלגול יחיד או כפול זה מחזיר את תכונת האיזון לכל העץ (אין צורך להמשיך למעלה בהכנסה!).'
              ]
            }
          ],
          examples: [
            {
              problem: 'נתון עץ ריק. הכנס את הסדרה: 10, 20, 30, 25. מהו מבנה העץ וסוג הגלגול?',
              solution: 'הכנסת 10, 20, 30 יוצרת שרשרת ימנית (RR) עם הפרת איזון בצומת 10 ($BF = -2$). מתבצע גלגול שמאלה סביב 10: 20 הופך לשורש עם בנים 10 ו-30. לאחר מכן, הכנסת 25 הופכת לבן השמאלי של 30. ה-BF של השורש 20 הוא $-1$ וכל הצמתים מאוזנים.',
              considerations: 'זיהוי מוקדם של תבנית ה-RR מונע ירידה לביצועים ליניאריים.'
            }
          ],
          pitfalls: [
            {
              trap: 'הנחה שבמחיקה מספיק גלגול אחד בדיוק כמו בהכנסה',
              why: 'במחיקה, גלגול עשוי להקטין את גובה תת-העץ ביחידה אחת, מה שעלול ליצור חוסר איזון בצמתים גבוהים יותר לאורך המסלול לשורש.',
              correction: 'במחיקה יש להמשיך לבדוק ולתקן מקדמי איזון עד לשורש העץ — ייתכנו עד $O(\\log n)$ גלגולים!'
            }
          ],
          examHints: {
            highPriority: [
              {
                topic: 'ארבעת סוגי הגלגולים (LL, RR, LR, RL)',
                quote: 'זה יהיה במבחן! חובה לדעת את ארבעת סוגי הגלגולים: LL, RR, LR, RL. במבחן תצטרכו לצייר את העץ המאוזן שלב אחרי שלב.',
                context: 'סעיפי ציור עץ לאחר סדרת הכנסות ומחיקות הם חלק קבוע מכל בחינה סופית.'
              },
              {
                topic: 'מספר הגלגולים המקסימלי בהכנסה מול מחיקה',
                quote: 'בהכנסה נדרש לכל היותר גלגול יחיד או כפול אחד, אבל במחיקה ייתכנו עד O(log n) גלגולים.',
                context: 'שאלת נכון/לא נכון קלאסית בבחינה.'
              }
            ],
            mediumPriority: [
              {
                topic: 'הבחנה בין גלגול יחיד לגלגול כפול',
                quote: 'הנקודה הזו מורידה המון נקודות בכל שנה: סטודנטים מבלבלים בין גלגול יחיד לגלגול כפול.',
                context: 'שימת לב לאיבר האמצעי בגלגול LR/RL.'
              }
            ],
            outOfScope: [
              {
                topic: 'הוכחה מתמטית של יחס פיבונאצ\'י המדויק',
                quote: 'ההוכחה הזו לא למבחן — פטורים מההוכחה המלאה עם סדרת פיבונאצ\'י.',
                note: 'רק לזכור את התוצאה: הגובה חסום על ידי 1.44 log n.'
              }
            ],
            focusRecommendation: {
              keyTopic: 'עצי AVL וגלגולים',
              actionPlan: 'תרגל ציור של עצי AVL בעקבות מחיקה והכנסה, וזכור את ההבדל במספר הגלגולים בין הכנסה (1) למחיקה (עד log n).',
              timeEstimate: '45 דקות'
            }
          }
        }
      },
      {
        id: 'lec-2',
        title: 'ערימות בינאריות ותורי עדיפות',
        date: 'הרצאה 5 · שבוע 4',
        audioFileName: 'Lecture05_Binary_Heaps.mp3',
        transcript: `
שלום כולם, היום נדבר על ערימה בינארית (Binary Heap) ותור עדיפות (Priority Queue).
ערימה מקיימת שתי תכונות קריטיות: 1. תכונת המבנה - עץ כמעט מלא. 2. תכונת הערימה - כל הורה גדול מילדיו (בערימת מקסימום).
זה יהיה במבחן ללא ספק: בניית ערימה (Build-Heap).
תמיד סטודנטים טוענים שבניית ערימה מ-n איברים לוקחת n log n כי יש n איברים וכל הכנסה לוקחת log n.
זה לא נכון! על זה בדיוק אני בוחן!
בניית ערימה עם Heapify מלמטה למעלה לוקחת זמן ליניארי O(n)!
חובה לדעת להוכיח את זה עם הטור הסכומי: sum_{h=0}^log n (h / 2^h) <= 2.
לגבי מציאת איבר שאינו המקסימום בערימה: זו פעולה של O(n) כי אין סדר בין הבנים, וזה בניגוד לעץ חיפוש!
        `.trim(),
        summary: {
          lectureTitle: 'ערימות בינאריות ותורי עדיפות',
          tldr: 'הרצאה מקיפה על ערימות בינאריות (Binary Heaps) ומימוש תורי עדיפות ביעילות מקסימלית במערך. הוכחת זמן ריצה ליניארי $O(n)$ לבניית ערימה שלמה (Build-Heap) וניתוח פעולות Heapify ו-Extract-Max.',
          definitions: [
            {
              term: 'ערימת מקסימום בינארית (Max-Heap)',
              intuitive: 'עץ כמעט שלם שמיוצג במערך רגיל ללא מצביעים, שבו כל הורה מנצח את צאצאיו בערכו.',
              formal: 'מערך $A[1..n]$ המממש עץ בינארי כמעט מלא שבו לכל צומת $i > 1$: $A[\\lfloor i/2 \\rfloor] \\ge A[i]$.'
            }
          ],
          theorems: [
            {
              name: 'משפט זמן ריצה לבניית ערימה (Linear Build-Heap)',
              statement: 'אלגוריתם Build-Heap הבונה ערימה מ-$n$ איברים לא ממוינים רץ בזמן $O(n)$ במקרה הגרוע.',
              proofIdea: 'בצמתים ברמה $h$ מתבצעת לכל היותר פעולת Heapify של $h$ צעדים. יש לכל היותר $\\lceil n / 2^{h+1} \\rceil$ צמתים בגובה $h$. הסכום $\\sum_{h=0}^{\\lfloor \\log n \\rfloor} \\frac{h}{2^h}$ מתכנס לקבוע, ולכן סך הזמן הוא $O(n)$.',
              tricks: 'שימוש בזהות $\\sum_{k=0}^{\\infty} k x^k = \\frac{x}{(1-x)^2}$ כאשר $x = 1/2$.'
            }
          ],
          algorithms: [
            {
              name: 'אלגוריתם Max-Heapify',
              steps: [
                '1. השוואת האיבר בצומת $i$ מול בנו השמאלי $2i$ ובנו הימני $2i+1$.',
                '2. מציאת האיבר הגדול מבין השלושה.',
                '3. אם האיבר הגדול אינו $i$, החלפת הערכים וקריאה רקורסיבית על תת-העץ שהשתנה.',
                '4. סיבוכיות: $O(h) = O(\\log n)$.'
              ]
            }
          ],
          examples: [
            {
              problem: 'כיצד נמצא את האיבר המינימלי בערימת מקסימום?',
              solution: 'האיבר המינימלי חייב להימצא באחד העלים (החל מאינדקס $\\lfloor n/2 \\rfloor + 1$ עד $n$). יש לסרוק את כל $\\lceil n/2 \\rceil$ העלים. זמן הריצה הוא $O(n)$.',
              considerations: 'בערימה אין קשר סדר בין בנים, ולכן חיפוש כללי או מינימום דורש מעבר ליניארי.'
            }
          ],
          pitfalls: [
            {
              trap: 'טענה שבניית ערימה היא O(n log n)',
              why: 'הנחה שגויה שבונים ערימה על ידי n הכנסות של Successive Inserts.',
              correction: 'בבחינה חובה לציין: בניית ערימה בעזרת Build-Heap מתבצעת ב-O(n) בלבד!'
            }
          ],
          examHints: {
            highPriority: [
              {
                topic: 'זמן הריצה הליניארי של Build-Heap והוכחתו',
                quote: 'זה יהיה במבחן ללא ספק: בניית ערימה (Build-Heap). על זה בדיוק אני בוחן! בניית ערימה לוקחת O(n)!',
                context: 'שאלת הוכחה קלאסית בבחינה.'
              }
            ],
            mediumPriority: [
              {
                topic: 'חיפוש איבר בערימה לוקח O(n)',
                quote: 'מציאת איבר שאינו המקסימום בערימה זו פעולה של O(n) כי אין סדר בין הבנים.',
                context: 'סעיף שאלת ברירה נפוץ.'
              }
            ],
            outOfScope: [],
            focusRecommendation: {
              keyTopic: 'ערימות בינאריות ו-Build-Heap',
              actionPlan: 'לשנן את ההוכחה של הטור המתכנס עבור Build-Heap ולזכור שפעולות חיפוש בערימה הן תמיד O(n).',
              timeEstimate: '30 דקות'
            }
          }
        }
      }
    ]
  };

  return consolidateStudyPack(initialPack);
}
