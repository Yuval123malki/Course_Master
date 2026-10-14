import React from 'react';
import { PageHead } from '../components/common/PageHead';

export function PrivacyPage() {
  return (
    <>
      <PageHead title="מדיניות פרטיות" desc="מידע על שמירת הנתונים במערכת הלמידה." />
      <section className="surface legal-content">
        <h2>שמירת נתונים מקומית</h2>
        <p>
          מערכת הלמידה פועלת בתצורת Local-First. כל ההתקדמות, התשובות לשאלות, הסימולציות וההערכות העצמיות נשמרות באופן בלעדי על המכשיר שלך באמצעות זיכרון הדפדפן (LocalStorage).
        </p>
        <p>
          איננו אוספים מידע אישי מזהה, איננו מפעילים שרתי מעקב ואיננו מעבירים מידע לגורמים שלישיים.
        </p>
      </section>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <PageHead title="תנאי שימוש" desc="תנאי השימוש במערכת הלמידה למבני נתונים." />
      <section className="surface legal-content">
        <h2>מטרת המערכת</h2>
        <p>
          מערכת זו נבנתה ככלי עזר לימודי ותרגול לקורס מבני נתונים במסלול האקדמי המכללה למינהל.
        </p>
        <p>
          החומרים, השאלות וההמחשות נועדו לסייע להבנת החומר ולהכנה לבחינה.
        </p>
      </section>
    </>
  );
}

export function CookiesPage() {
  return (
    <>
      <PageHead title="קוקיז ואחסון מקומי" desc="כיצד המערכת שומרת את מצב הלמידה שלך." />
      <section className="surface legal-content">
        <h2>אחסון בדפדפן (LocalStorage)</h2>
        <p>
          האתר אינו עושה שימוש בקוקיז לצורכי מעקב או פרסום. האתר עושה שימוש ב-LocalStorage של הדפדפן לשם שמירת מצב ההתקדמות שלך בקורס בלבד.
        </p>
      </section>
    </>
  );
}

export function AccessibilityPage() {
  return (
    <>
      <PageHead title="הצהרת נגישות" desc="הנגשת מערכת הלמידה לכלל המשתמשים." />
      <section className="surface legal-content">
        <h2>התאמות נגישות באתר</h2>
        <ul>
          <li>תמיכה מלאה בכיווניות ימין-שמאל (RTL) עבור השפה העברית.</li>
          <li>ניווט מקלדת מלא בכל חלקי האתר (כולל קיצור דרך ⌘K לחיפוש ו-Esc לסגירה).</li>
          <li>כפתור דילוג לתוכן הראשי (Skip link) לקוראי מסך.</li>
          <li>ניגודיות צבעים גבוהה וקריאה בהתאם לתקן WCAG 2.1 AA.</li>
          <li>תיוגי ARIA תקינים בדיאלוגים, תפריטים וטפסים.</li>
        </ul>
      </section>
    </>
  );
}
