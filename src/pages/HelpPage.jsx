import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Wand2,
  Users,
  Moon,
  Sun,
  Calendar,
  Layers,
  FlaskConical,
  CheckCircle2,
  Timer,
  Printer,
  Download,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Keyboard,
  Award,
  AlertTriangle,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { PageHead, Pill } from '../components/common/PageHead';
import { navigate } from '../utils/dom';

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState('all');

  const guideSections = [
    {
      id: 'studio',
      icon: <Sparkles size={20} color="var(--primary)" />,
      title: 'סטודיו המאסטר ויצירת קורס חדש',
      badge: 'יצירת תוכן',
      content: `
        <p><b>איך ליצור קורס חדש מכלום ב-5 צעדים פשוטים?</b></p>
        <ol>
          <li>לחץ על <b>"סטודיו המאסטר"</b> בסרגל העליון או בסרגל הצדי.</li>
          <li>לחץ על <b>"יצירת קורס חדש"</b>.</li>
          <li><b>שלב 1 - פרטי הקורס:</b> הזן את שם הקורס (למשל "חדו״א 1" או "אלגברה ליניארית"), מוסד אקדמי ומספר נקודות זכות. ניתן גם לבחור תבנית מוכנה בלחיצה אחת.</li>
          <li><b>שלב 2 - סילבוס ונושאים:</b> הדבק את רשימת הנושאים מתוך הסילבוס (למשל: "1. גבולות 2. נגזרות...") או העלה קובץ סילבוס (PDF, Word, TXT, Markdown).</li>
          <li><b>שלבים 3-5:</b> ניתן לצרף חומרי לימוד ושאלות מבחן, או לתת למנוע לסנתז הכל אוטומטית!</li>
          <li>לחץ על <b>"הפק ופרסם קורס שלם"</b> — המערכת תבנה אוטומטית פרקי לימוד מפורטים, שאלות מבחן מדורגות עם רמזים, כרטיסיות זיכרון, דף נוסחאות ומבחן סימולציה שלם!</li>
        </ol>
      `
    },
    {
      id: 'studypack',
      icon: <Wand2 size={20} color="var(--accent)" />,
      title: 'מחולל Study Pack אוטומטי (בסגנון NotebookLM)',
      badge: 'AI & אוטומציה',
      content: `
        <p><b>איך עובד מחולל ה-Study Pack להרצאות מוקלטות ותמלילים?</b></p>
        <ul>
          <li><b>העלאת קבצים:</b> היכנס ל-"מחולל Study Pack" בסרגל הצדי והעלה קובצי אודיו (m4a, mp3, wav) או קובצי תמלילים (txt, pdf, docx, srt, vtt).</li>
          <li><b>הפעלת Pipeline מלא:</b> לחץ על "הפעל Pipeline מלא". המערכת תסרוק את החומרים ותפעיל שני תהליכים במקביל:
            <ul>
              <li><b>תהליך א' - סיכום אקדמי מעמיק:</b> פרסונת מתרגל בכיר המפיק תקציר TL;DR, הגדרות עם הסבר אינטואיטיבי + הגדרה פורמלית ב-LaTeX, משפטים והוכחות (Proof Idea), אלגוריתמים צעד-אחר-צעד ומלכודות שכיחות.</li>
              <li><b>תהליך ב' - דוח דגשי מרצה ורמזים למבחן:</b> זיהוי אוטומטי של אמירות מפורשות כגון <i>"זה יהיה במבחן"</i> (High Priority), דגשים חוזרים, ונושאים שהמרצה פטר מהם ("לא למבחן").</li>
            </ul>
          </li>
          <li><b>ספר הקורס המלא (Master Book):</b> המערכת ממזגת את כל ההרצאות למסמך מסכם מאוחד ללא כפילויות עם תוכן עניינים מקושר ונספח רמזים מרוכז.</li>
          <li><b>ייצוא והמרה:</b> ניתן להוריד כ-Markdown (.md), להדפיס כ-PDF, או ללחוץ על <b>"המר לקורס פעיל ב-CourseForge"</b> לייבוא מיידי לכל מסכי התרגול!</li>
        </ul>
      `
    },
    {
      id: 'users',
      icon: <Users size={20} color="var(--success)" />,
      title: 'ניהול משתמשים, פרופילים וסימולטור מגן',
      badge: 'התאמה אישית',
      content: `
        <p><b>ניהול פרופילי למידה והפרדת נתונים:</b></p>
        <ul>
          <li><b>פרופיל סטודנט:</b> לחץ על כפתור הפרופיל (האווטאר) בסרגל העליון כדי לערוך את שמך, מוסד אקדמי, תואר וציון יעד.</li>
          <li><b>ריבוי פרופילים:</b> בלשונית "החלפת סטודנט" ניתן להוסיף פרופילים שונים (או פרופיל נפרד למועד א' ומועד ב'). לכל פרופיל יש שמירה מקומית עצמאית לחלוטין (התקדמות, סימניות וטעויות).</li>
          <li><b>מחשבון ציון יעד ומגן:</b> בלשונית "מחשבון ציון יעד" ניתן להזין את משקל המגן וציוני המטלות, ולחשב בדיוק איזה ציון עליך להשיג בבחינה כדי להגיע לציון היעד שלך. המחשבון מתריע על כלל 55+ במבחן ומסמן זכאות להצטיינות.</li>
        </ul>
      `
    },
    {
      id: 'calendar',
      icon: <Calendar size={20} color="#f59e0b" />,
      title: 'יומן מבחנים, ספירה לאחור ואבני דרך',
      badge: 'ניהול זמן',
      content: `
        <p><b>תכנון אקדמי לקראת יום הבחינה:</b></p>
        <ul>
          <li><b>ספירה לאחור חיה:</b> מונה דיגיטלי של ימים, שעות, דקות ושניות למועד א' או ב'.</li>
          <li><b>הגדרת תאריך הבחינה:</b> לחץ על שדה התאריך ביומן כדי להגדיר את יום הבחינה שלך. התאריך נשמר אוטומטית בפרופיל.</li>
          <li><b>אבני דרך מדורגות:</b> תוכנית עבודה מוכחת: שבועיים לפני (סיום תיאוריה), שבוע לפני (מרתון 25 שאלות), 3 ימים לפני (2 סימולציות מלאות), ויום לפני (מעבר על דף הנוסחאות).</li>
          <li><b>צ'ק-ליסט יומי:</b> סימון משימות יומיות לשימור רצף הלמידה (Streak).</li>
        </ul>
      `
    },
    {
      id: 'cards',
      icon: <Layers size={20} color="var(--primary)" />,
      title: 'כרטיסיות זיכרון חכמות בשיטת לייטנר',
      badge: 'חזרה מרווחת',
      content: `
        <p><b>איך להפיק את המקסימום מכרטיסיות הזיכרון?</b></p>
        <ul>
          <li><b>שיטת לייטנר (5 רמות שליטה):</b> כרטיס שאתה יודע היטב מתקדם לרמה הבאה. כרטיס שטעית בו חוזר לרמה 1 לחזרה קרובה.</li>
          <li><b>היפוך תלת-ממדי:</b> הקש על מקש <b>Space</b> או לחץ על הכרטיס כדי להציג את התשובה וההסבר המלא.</li>
          <li><b>קיצורי מקשים מהירים:</b> הקש <b>1</b> לסימון "דורש חזרה", או <b>2</b> לסימון "ידעתי היטב", וחצים ימינה/שמאלה לניווט.</li>
          <li><b>אפקטי סאונד:</b> צליל עדין מאשר את הלחיצה ומגביר את תחושת ההישג. ניתן להשתיק בכל שלב באמצעות כפתור הרמקול.</li>
        </ul>
      `
    },
    {
      id: 'practice',
      icon: <CheckCircle2 size={20} color="var(--cyan)" />,
      title: 'בנק שאלות, רמזים מדורגים ומאגר טעויות',
      badge: 'תרגול מעשי',
      content: `
        <p><b>שיטת פתרון מודרכת:</b></p>
        <ul>
          <li><b>רמזים מדורגים:</b> בכל שאלה ישנם רמזים הנפתחים בזה אחר זה בלחיצה, כדי לאפשר לך לפתור בעצמך לפני חשיפת הפתרון המלא.</li>
          <li><b>פתרון ומחוון ניקוד:</b> פתרונות מפורטים הכוללים הסבר שיטתי, סעיפי מחוון (Rubric), ומלכודת שכיחה שממנה יש להיזהר.</li>
          <li><b>מאגר טעויות אוטומטי:</b> סימון שאלה כטעות מוסיף אותה מיידית ל-"מאגר טעויות", ומאפשר לחזור עליה שוב לקראת המבחן.</li>
          <li><b>סימניות:</b> שמור שאלות מורכבות בלחיצה על כפתור הסימנייה לחזרה מהירה במסך "שמור לחזרה".</li>
        </ul>
      `
    },
    {
      id: 'simulations',
      icon: <Timer size={20} color="#ec4899" />,
      title: 'סימולציות מבחן שלמות בזמן אמת',
      badge: 'בחינות אמת',
      content: `
        <p><b>בדיקת מוכנות בתנאי בחינה אמיתיים:</b></p>
        <ul>
          <li><b>שעון עצר מובנה של 3 שעות:</b> סופר לאחור ומדמה את הלחץ והקצב של הבחינה הרשמית.</li>
          <li><b>שאלות ברירה ושאלות פתוחות:</b> מעבר מהיר בין שאלות, סימון בדגל (Flag) לשאלות שתרצה לחזור אליהן, וכתיבת טיוטת תשובה.</li>
          <li><b>הגשה ובדיקה עצמית:</b> לאחר ההגשה המערכת חושפת את הפתרונות המלאים והמחוון לבדיקה עצמית ולחישוב הציון הסופי.</li>
        </ul>
      `
    },
    {
      id: 'lab',
      icon: <FlaskConical size={20} color="var(--indigo)" />,
      title: 'מעבדה אינטראקטיבית והמחשות ויזואליות',
      badge: 'הבנה עמוקה',
      content: `
        <p><b>13 הדמיות חיות לכל מבני הנתונים והאלגוריתמים:</b></p>
        <ul>
          <li><b>עצים:</b> עצי חיפוש בינאריים (BST), גלגולי עצי AVL (LL, RR, LR, RL), וסריקות עץ (Inorder, Preorder, Postorder).</li>
          <li><b>ערימות:</b> ערימת מקסימום, פעולות Heapify ובניית ערימה ב-O(n).</li>
          <li><b>מיונים:</b> חלוקת Quicksort (Partition) ומיון מנייה (Counting Sort).</li>
          <li><b>רשימות וגיבוב:</b> הכנסה ומחיקה ברשימה מקושרת, היפוך רשימה במקום, וטבלאות גיבוב.</li>
        </ul>
      `
    },
    {
      id: 'export',
      icon: <Printer size={20} color="var(--primary)" />,
      title: 'ייצוא סיכומים, דפי נוסחאות וגיבוי נתונים',
      badge: 'הדפסה וייצוא',
      content: `
        <p><b>הדפסה ושמירה בלחיצה אחת:</b></p>
        <ul>
          <li><b>דף נוסחאות מרוכז (PDF):</b> לחץ על כפתור "סיכום PDF" בסרגל העליון לצפייה והדפסת דף נוסחאות מותאם ל-A4.</li>
          <li><b>ייצוא ספר קורס ב-Markdown:</b> במחולל ה-Study Pack לחץ על "ייצוא Markdown" להורדת קובץ .md מלא הכולל את כל ההרצאות.</li>
          <li><b>גיבוי ושחזור נתונים:</b> במסך "הגדרות וגיבוי" או במודאל המשתמש ניתן לייצא את כל ההתקדמות לקובץ JSON ולשחזרו בכל מחשב.</li>
        </ul>
      `
    }
  ];

  const shortcuts = [
    { key: '⌘ K / Ctrl + K', action: 'חיפוש מהיר בכל הקורס (שאלות, פרקים, מושגים)' },
    { key: 'Space / Enter', action: 'היפוך כרטיסיית זיכרון (הצגת שאלה/תשובה)' },
    { key: '1', action: 'סימון כרטיסייה כ"דורשת חזרה"' },
    { key: '2', action: 'סימון כרטיסייה כ"ידועה היטב"' },
    { key: '← / →', action: 'מעבר לכרטיסייה הבאה / הקודמת' },
    { key: 'Esc', action: 'סגירת חלונות קופצים, חיפוש ומודאלים' }
  ];

  const filteredSections = guideSections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.badge.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <PageHead
        eyebrow="מרכז התמיכה והעזרה של CourseForge"
        title="מדריך השימוש המלא וכל תכונות הפלטפורמה"
        desc="מדריך מקיף וסדור לכל תכונה במערכת: יצירת קורסים חדשים, מחולל ה-Study Pack החכם, ניהול משתמשים, כרטיסיות זיכרון, יומן מבחנים וקיצורי מקשים."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="primary"
              onClick={() => navigate('studypack')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            >
              <Wand2 size={16} />
              <span>למחולל ה-Study Pack</span>
            </button>
            <button
              className="ghost-button"
              onClick={() => navigate('home')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <ArrowLeft size={16} />
              <span>חזרה לדף הבית</span>
            </button>
          </div>
        }
      />

      {/* Interactive Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <Search size={20} color="var(--primary)" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="חפש במדריך: איך יוצרים קורס, מחולל Study Pack, כרטיסיות, לייטנר, מגן, קיצורים..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '1rem',
            color: 'var(--text-primary)'
          }}
        />
        {searchQuery && (
          <button
            className="ghost-button"
            onClick={() => setSearchQuery('')}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            נקה
          </button>
        )}
      </div>

      {/* Guide Sections Accordion / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40 }}>
        {filteredSections.map(sec => {
          const isExpanded = expandedSection === 'all' || expandedSection === sec.id;

          return (
            <div
              key={sec.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl, 20px)',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                onClick={() => setExpandedSection(expandedSection === sec.id ? '' : sec.id)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'var(--bg-surface)' : 'var(--bg-card-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'var(--primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {sec.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{sec.title}</h3>
                    <small style={{ color: 'var(--text-muted)' }}>{sec.badge}</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="pill" style={{ fontSize: '0.75rem' }}>{sec.badge}</span>
                  {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: '20px 28px 24px 28px',
                    borderTop: '1px solid var(--border-subtle)',
                    lineHeight: 1.7,
                    fontSize: '0.94rem',
                    color: 'var(--text-secondary)'
                  }}
                  dangerouslySetInnerHTML={{ __html: sec.content }}
                />
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="surface" style={{ padding: 40, textAlign: 'center' }}>
            <HelpCircle size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
            <h3>לא נמצאו נושאי עזרה התואמים לחיפוש "{searchQuery}"</h3>
            <p style={{ color: 'var(--text-muted)' }}>נסה מונחי חיפוש כלליים יותר כגון "קורס", "Study Pack", "כרטיסיות" או "מבחן".</p>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Cheat Sheet */}
      <section
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Keyboard size={22} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>טבלת קיצורי מקשים ללמידה מהירה</h2>
        </div>
        <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          השתמש במקלדת כדי לנווט ולתרגל במהירות שיא מבלי לגעת בעכבר:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-page)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{sc.action}</span>
              <kbd
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--primary)',
                  fontWeight: 700
                }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
