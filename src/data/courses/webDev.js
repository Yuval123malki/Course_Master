export const webDevCourse = {
  id: 'webdev',
  category: 'web',
  categoryLabel: 'פיתוח תוכנה ואינטרנט',
  badgeColor: '#059669',
  icon: 'Globe',
  courseData: {
    COURSE: {
      name: 'פיתוח אפליקציות אינטרנט',
      nameEn: 'Web Applications Development',
      code: '624103',
      inst: 'המחלקה להנדסת תוכנה ומערכות מידע',
      year: 'תשפ״ו',
      semester: 'סמסטר ב׳',
      credits: '4.00 נ"ז / 5.00 ש"ס',
      lecturers: 'ד"ר עומר לוין, אינג׳ רועי כרמל',
      tutors: 'דנה שגב, גיא פלג, תומר שוורץ',
      prereq: 'מבוא למדעי המחשב, מבני נתונים'
    },
    EXAM_FORMAT: {
      time: '2.5 שעות',
      aids: 'חומר סגור / דף עזר',
      structure: 'חלק א׳: שאלות ניתוח קוד ותיקון באגים (React/JS). חלק ב׳: כתיבת רכיב או שרת REST API מלא.'
    },
    TOPICS: [
      {
        id: 'js-async',
        n: 1,
        title: 'JavaScript מודרני, אסינכרוניות ו-Event Loop',
        tag: 'JavaScript & Async',
        prio: 'A',
        syl: 'ES6+ Features, Closures, Scopes, Promises, async/await, Event Loop (Microtasks & Macrotasks), Fetch API.',
        srcs: ['הרצאה 1-3 - Modern JS & Async', 'תרגול 1 - ניתוח סדר הרצה ב-Event Loop'],
        why: 'הבנת אסינכרוניות היא המוקש העיקרי בכל שאלה על JavaScript בבחינה.',
        sec: [
          {
            h: 'ה-Event Loop וסדר הרצת משימות',
            html: `
              <p>ב-JavaScript מנוע ההרצה הוא Single-Threaded. כדי לנהל פעולות אסינכרוניות, המנוע משתמש בתורי משימות:</p>
              <div class="card">
                <div class="ttl">סדר הקדימויות בהרצה</div>
                <ol>
                  <li><b>Call Stack (קוד סינכרוני רגיל):</b> מבוצע מיד עד לסיומו המלא.</li>
                  <li><b>Microtask Queue (מיקרו-משימות):</b> הבטחות (<code dir="ltr">Promise.then</code>, <code dir="ltr">catch</code>, <code dir="ltr">queueMicrotask</code>). מרוקן במלואו <i>לפני</i> כל מקרו-משימה!</li>
                  <li><b>Macrotask / Task Queue (מקרו-משימות):</b> <code dir="ltr">setTimeout</code>, <code dir="ltr">setInterval</code>, <code dir="ltr">I/O</code>, אירועי DOM.</li>
                </ol>
              </div>
            `
          }
        ]
      },
      {
        id: 'react-core',
        n: 2,
        title: 'React: רכיבים, מצב (State) ומחזור חיים',
        tag: 'React Core',
        prio: 'A',
        syl: 'JSX, Functional Components, Virtual DOM & Reconciliation, useState, Immutability, Lifting State Up, Controlled Components.',
        srcs: ['הרצאה 4-6 - React Basics', 'תרגול 2 - ניהול State ועדכונים אסינכרוניים'],
        why: 'הספרייה המובילה בעולם לבניית ממשקי משתמש מורכבים.',
        sec: [
          {
            h: 'אי-השתנות (Immutability) בעדכון State',
            html: `
              <p>ב-React אסור לשנות (mutate) אובייקטים או מערכים ב-State ישירות! יש תמיד לייצר עותק חדש:</p>
              <pre dir="ltr"><code>// שגוי — שינוי ישיר של המערך
todos.push(newTodo);
setTodos(todos); // React לא תזהה שינוי כתובת ולא תרנדר מחדש!

// נכון — יצירת עותק חדש עם Spread operator
setTodos(prev => [...prev, newTodo]);</code></pre>
            `
          }
        ]
      },
      {
        id: 'react-hooks',
        n: 3,
        title: 'React Hooks: useEffect, useRef, useMemo',
        tag: 'React Hooks',
        prio: 'A',
        syl: 'useEffect וניהול תלויות, פונקציית Cleanup, useRef לשמירת הפניה וערכים ללא רינדור, useMemo ו-useCallback לייעול.',
        srcs: ['הרצאה 7-8 - React Hooks מתקדמים', 'תרגול 3 - מניעת לולאות אינסופיות ב-useEffect'],
        why: 'שאלות בחינה ב-React כמעט תמיד בודקות באגים של תלויות ב-useEffect או זיכרון.',
        sec: [
          {
            h: 'חוקי ה-useEffect וה-Cleanup',
            html: `
              <p>ה-Hook <code dir="ltr">useEffect</code> מופעל לאחר הרינדור של הרכיב בדפדפן:</p>
              <ul>
                <li><b>ללא מערך תלויות:</b> מופעל אחרי כל רינדור.</li>
                <li><b>מערך ריק <code dir="ltr">[]</code>:</b> מופעל פעם אחת בלבד בעליית הרכיב (Mount).</li>
                <li><b>מערך עם משתנים <code dir="ltr">[a, b]</code>:</b> מופעל כאשר a או b משתנים.</li>
              </ul>
              <div class="card">
                <div class="ttl">פונקציית Cleanup (ניקוי)</div>
                <p>הפונקציה המוחזרת מ-useEffect מתבצעת בעת הסרת הרכיב (Unmount) או לפני הפעלת ה-Effect הבא, כדי לבטל מאזינים, טיימרים או בקשות רשת.</p>
              </div>
            `
          }
        ]
      },
      {
        id: 'backend-rest',
        n: 4,
        title: 'Node.js, Express וארכיטקטורת REST API',
        tag: 'Backend & REST',
        prio: 'A',
        syl: 'פרוטוקול HTTP, מתודות GET, POST, PUT, DELETE, קודי סטטוס (200, 201, 400, 401, 404, 500), Express Middleware, Routing, CORS, אימות JWT.',
        srcs: ['הרצאה 9-11 - Node.js & Express REST APIs', 'תרגול 4 - בניית שרת מאובטח עם אימות'],
        why: 'תקשורת בין לקוח לשרת היא עמוד השדרה של כל אפליקציה מלאה.',
        sec: [
          {
            h: 'עקרונות REST API וקודי סטטוס HTTP',
            html: `
              <div class="table-wrap">
                <table class="ops-table">
                  <thead><tr><th>מתודה</th><th>פעולה</th><th>דוגמת נתיב</th><th>קוד הצלחה</th></tr></thead>
                  <tbody>
                    <tr><td><b>GET</b></td><td>קריאת נתונים</td><td><code dir="ltr">/api/users/:id</code></td><td>200 OK</td></tr>
                    <tr><td><b>POST</b></td><td>יצירת משאב חדש</td><td><code dir="ltr">/api/users</code></td><td>201 Created</td></tr>
                    <tr><td><b>PUT</b></td><td>עדכון מלא</td><td><code dir="ltr">/api/users/:id</code></td><td>200 OK</td></tr>
                    <tr><td><b>DELETE</b></td><td>מחיקת משאב</td><td><code dir="ltr">/api/users/:id</code></td><td>200 או 204</td></tr>
                  </tbody>
                </table>
              </div>
            `
          }
        ]
      }
    ],
    QUESTIONS: [
      {
        id: 'WEB-01',
        topic: 'js-async',
        lvl: 2,
        type: 'ניתוח פלט',
        skill: 'Event Loop',
        origin: 'orig',
        src: 'מבחן פיתוח אפליקציות 2025 מועד א׳',
        q: `מה יהיה הפלט המדויק המודפס למסוף (Console) כתוצאה מהרצת הקוד הבא?<br/><pre dir="ltr"><code>console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");</code></pre>`,
        hints: [
          'זהו את הקוד הסינכרוני שרץ מיד ב-Call Stack.',
          'הבדילו בין Microtask (Promise) לבין Macrotask (setTimeout).'
        ],
        sol: `
          <p><b>הפלט המדויק:</b></p>
          <pre dir="ltr"><code>1
4
3
2</code></pre>
          <p><b>הסבר צעד אחר צעד:</b></p>
          <ol>
            <li><code dir="ltr">console.log("1")</code> רץ סינכרונית ומדפיס 1.</li>
            <li><code dir="ltr">setTimeout</code> רושם מקרו-משימה לתור המשימות הרגיל.</li>
            <li><code dir="ltr">Promise.resolve().then</code> רושם מיקרו-משימה לתור המיקרו-משימות.</li>
            <li><code dir="ltr">console.log("4")</code> רץ סינכרונית ומדפיס 4.</li>
            <li>ה-Call Stack מתרוקן. המנוע בודק קודם את תור המיקרו-משימות, מוצא את ה-Promise ומדפיס 3!</li>
            <li>רק כשתור המיקרו-משימות ריק, ה-Event Loop ניגש למקרו-משימה הבאה ומדפיס 2!</li>
          </ol>
        `,
        check: 'וודאו שהבנתם מדוע ה-Promise (3) מקדים את ה-setTimeout (2) למרות שהטיימר הוגדר ל-0ms.',
        mistake: 'טעות שכיחה: כתיבת 1, 2, 3, 4 לפי סדר השורות בקובץ.',
        rubric: 'סדר נכון של 1 ו-4 (30%), 3 לפני 2 (50%), הסבר תורי המשימות (20%).'
      },
      {
        id: 'WEB-02',
        topic: 'react-hooks',
        lvl: 3,
        type: 'מציאת ותיקון באג',
        skill: 'useEffect Dependencies',
        origin: 'orig',
        src: 'מבחן פיתוח אפליקציות 2025 מועד ב׳',
        q: `הרכיב הבא נכנס ללולאת רינדור אינסופית (Infinite Loop). הסבירו מדוע, ותקנו את הקוד:<br/><pre dir="ltr"><code>function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(data => setUser(data));
  });

  return &lt;div&gt;{user?.name}&lt;/div&gt;;
}</code></pre>`,
        hints: [
          'התבוננו במערך התלויות של useEffect. מה חסר בו?',
          'מה קורה כאשר setUser מופעל בתוך רכיב ללא תלויות מוגדרות?'
        ],
        sol: `
          <p><b>ההסבר לבאג:</b></p>
          <p>ה-Hook <code dir="ltr">useEffect</code> נכתב ללא מערך תלויות כלל (חסר הפרמטר השני). כתוצאה מכך, הוא מופעל מחדש לאחר <b>כל רינדור</b> של הרכיב. בתוך ה-Effect מופעל <code dir="ltr">setUser</code>, שגורם לעדכון ה-State ולרינדור מחדש, אשר שוב מפעיל את ה-Effect, וחוזר חלילה בלולאה אינסופית הקורסת את הדפדפן.</p>
          <p><b>הקוד המתוקן:</b></p>
          <pre dir="ltr"><code>function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    fetchUser(userId).then(data => {
      if (isMounted) setUser(data);
    });
    return () => { isMounted = false; };
  }, [userId]); // הוספת מערך תלויות עם userId!

  return &lt;div&gt;{user?.name}&lt;/div&gt;;
}</code></pre>
        `,
        check: 'האם הסברתם את מחזור העדכון שגורם ללולאה?',
        mistake: 'השארת מערך ריק [] שלא יעדכן נתונים אם ה-userId ישתנה.',
        rubric: 'זיהוי היעדר מערך תלויות (40%), הסבר מנגנון הלולאה (30%), קוד תקין עם [userId] ו-cleanup (30%).'
      }
    ],
    SIMS: [
      {
        id: 'sim-web-1',
        title: 'סימולציית מבחן פיתוח Full Stack — מועד א׳',
        level: 'רמה אקדמית / ראיון טכני',
        meta: { duration: '2.5 שעות', shape: 'שאלה פתוחה + שאלות ברירה' },
        items: [
          {
            id: 'Q1',
            part: 'open',
            title: 'שאלה 1 (פתוחה) — כתיבת Custom Hook',
            q: 'כתבו Custom Hook בשם useDebounce(value, delay) המקבל ערך ועיכוב במילישניות, ומחזיר את הערך המעודכן רק לאחר שחלף הזמן המבוקש ללא שינוי נוסף.',
            sol: 'שימוש ב-useState וב-useEffect עם setTimeout ופונקציית cleanup המבצעת clearTimeout בכל שינוי.'
          },
          {
            id: 'Q2',
            part: 'mcq',
            title: 'שאלה 2 — קודי סטטוס HTTP',
            q: 'איזה קוד סטטוס HTTP הוא המתאים ביותר כאשר לקוח שולח בקשת יצירת משתמש עם כתובת אימייל שאינה תקינה לפי כללי הפורמט?',
            choices: [
              '400 Bad Request',
              '401 Unauthorized',
              '404 Not Found',
              '500 Internal Server Error'
            ],
            ans: 'א',
            sol: '400 Bad Request מציין שגיאת לקוח באימות או במבנה הקלט.'
          }
        ]
      }
    ],
    CARDS: [
      { id: 'card-w1', topic: 'js-async', q: 'מה ההבדל בין Microtask ל-Macrotask ב-Event Loop?', a: 'Microtasks (כמו Promise) מבוצעות מיד בסיום הקוד הסינכרוני לפני כל Macrotask (כמו setTimeout)' },
      { id: 'card-w2', topic: 'react-core', q: 'מדוע חובה לשמור על Immutability ב-React State?', a: 'כדי ש-React תוכל לזהות שינוי בבדיקת כתובת רדודה (Shallow comparison) ולהפעיל רינדור מחדש' },
      { id: 'card-w3', topic: 'react-hooks', q: 'מה תפקיד פונקציית ה-Cleanup המוחזרת מ-useEffect?', a: 'לנקות משאבים, לבטל מאזינים או טיימרים בעת Unmount או לפני הרינדור הבא' },
      { id: 'card-w4', topic: 'backend-rest', q: 'מה ההבדל בין מתודת PUT למתודת POST ב-REST?', a: 'POST יוצרת משאב חדש ואינה אידמפוטנטית; PUT מעדכנת/מחליפה משאב קיים במלואו והיא אידמפוטנטית' }
    ],
    PITFALLS: [
      {
        t: 'השמטת תלויות ב-useEffect (Missing Dependencies)',
        why: 'השמטת משתנים המוזכרים ב-Effect עלולה ליצור Stale Closures (ערכים ישנים שאינם מתעדכנים).',
        right: 'כל משתנה או פונקציה מהרכיב המשמשים בתוך ה-Effect חייבים להיכלל במערך התלויות!',
        topic: 'react-hooks',
        sev: 'high'
      },
      {
        t: 'מוטציה ישירה של מערך או אובייקט ב-State',
        why: 'שימוש ב-push או השמה ישירה state.prop = x לא מפעיל Re-render.',
        right: 'תמיד לייצר עותק חדש באמצעות Spread [...arr] או { ...obj }!',
        topic: 'react-core',
        sev: 'high'
      }
    ],
    PLANS: [
      {
        id: 'standard',
        title: 'תוכנית לימוד מרתונית — 4 ימים לבחינה',
        days: [
          { d: 1, learn: 'JavaScript אסינכרוני ו-Event Loop', drill: 'מעקב ידני אחרי סדר פלטים עם Promises ו-setTimeout', note: 'הפרדה מוחלטת בין Microtasks ל-Macrotasks' },
          { d: 2, learn: 'React: מחזור חיים, Immutability ו-Virtual DOM', drill: 'פתרון שאלת עדכון State מורכב ורשימות', note: 'הבנת מנגנון ה-Reconciliation והמפתחות (keys)' },
          { d: 3, learn: 'React Hooks מתקדמים ו-Custom Hooks', drill: 'מימוש useDebounce ו-useFetch עם Cleanup', note: 'טיפול במניעת Stale Closures ו-Memory Leaks' },
          { d: 4, learn: 'Node.js, Express ו-RESTful APIs', drill: 'כתיבת Endpoint מלא עם אימות קלט וטיפול בשגיאות', note: 'הבחנה בין קודי שגיאה 400, 401, 403, 404 ו-500' }
        ]
      }
    ],
    CONFLICTS: [],
    TBL_STRUCT: {
      cols: ['React Hook', 'מטרה', 'מתי רץ / מתעדכן', 'ערך מוחזר', 'שימוש אופייני'],
      rows: [
        ['useState', 'ניהול State מקומי', 'בכל שינוי ערך', '[state, setState]', 'משתני ממשק וטפסים'],
        ['useEffect', 'תופעות לוואי ו-Lifecycle', 'אחרי רינדור בהתאם ל-deps', 'פונקציית cleanup (אופציונלי)', 'קריאות API, האזנה לאירועים'],
        ['useMemo', 'Memoization של חישוב כבד', 'כאשר ערכי deps משתנים', 'התוצאה המחושבת', 'מיון וסינון רשימות גדולות'],
        ['useCallback', 'שימור רפרנס של פונקציה', 'כאשר ערכי deps משתנים', 'פונקציה memoized', 'העברת callbacks לרכיבי בן עטופים ב-memo'],
        ['useRef', 'הפניה ל-DOM או ערך שאינו מרנדר', 'מתמיד בין רינדורים ללא טריגר', '{ current: val }', 'פוקוס ל-input, שמירת טיימרים']
      ]
    },
    TBL_SORT: {
      cols: ['שיטת HTTP', 'משמעות ומטרה', 'אידמפוטנטיות (Idempotent)', 'קוד הצלחה אופייני', 'הערות'],
      rows: [
        ['GET', 'שליפת משאב מהשרת', '✓ כן (Safe & Idempotent)', '200 OK', 'אסור לשנות מצב בשרת!'],
        ['POST', 'יצירת משאב חדש בשרת', '✗ לא אידמפוטנטי (יוצר כל פעם מחדש)', '201 Created', 'גוף הבקשה מכיל את הנתונים'],
        ['PUT', 'החלפה/עדכון מלא של משאב קיים', '✓ כן (חזרה על הפעולה משאירה אותו מצב)', '200 OK או 204 No Content', 'דורש שליחת כל שדות המשאב'],
        ['PATCH', 'עדכון חלקי של שדות מסוימים', '✗ תלוי מימוש (לרוב לא)', '200 OK', 'עדכון יעיל ללא דריסת שדות אחרים'],
        ['DELETE', 'מחיקת משאב מהשרת', '✓ כן (מחיקה חוזרת לא משנה את היעדרו)', '200 OK או 204 No Content', 'קריאה שנייה עשויה להחזיר 404 אך המצב בעינו']
      ],
      notes: [
        'אידמפוטנטיות פירושה שהפעלת הפעולה N פעמים מניבה את אותה תוצאה במערכת כמו הפעלה בודדת.',
        'בקשות GET ו-HEAD נחשבות גם כ-Safe (בטוחות לקריאה ללא תופעות לוואי).'
      ]
    },
    FORMULAS: [
      {
        g: 'עקרונות JavaScript וה-Event Loop',
        src: 'הרצאה 1 וסיכומי מנוע V8',
        items: [
          { k: 'סדר עדיפויות ה-Event Loop', v: 'Call Stack (קוד סינכרוני) ⟶ Microtasks (Promises) ⟶ Render Pipeline ⟶ Macrotasks (setTimeout)', n: 'תור ה-Microtasks מתרוקן במלואו לפני המקרו-טאסק הבא!' },
          { k: 'Promise States', v: 'Pending ⟶ Fulfilled (resolve) / Rejected (reject)', n: 'המעבר הוא חד-כיווני ובלתי הפיך' },
          { k: 'מבנה Closure', v: '<code dir="ltr">function outer() { let x = 1; return () => x++; }</code>', n: 'הפונקציה הפנימית לוכדת את הסקופ הלקסיקלי' }
        ]
      },
      {
        g: 'React ו-REST API',
        src: 'הרצאות 2-4 ודף הנחיות לפיתוח',
        items: [
          { k: 'חוקי ה-Hooks', v: '1. קריאה רק ברמה העליונה של הרכיב. 2. קריאה רק מפונקציות React או Custom Hooks.', n: 'אסור לקרוא ל-Hooks בתוך תנאי if, לולאות או פונקציות מקוננות!' },
          { k: 'קודי סטטוס HTTP מרכזיים', v: '200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error', n: '4xx = שגיאת לקוח, 5xx = שגיאת שרת' },
          { k: 'הגדרת CORS', v: '<code dir="ltr">Access-Control-Allow-Origin: *</code>', n: 'מנגנון אבטחה של הדפדפן להגבלת קריאות בין דומיינים שונים' }
        ]
      }
    ],
    LASTMIN: [
      {
        h: 'ה-Event Loop: מיקרו-טאסקים קודמים למקרו-טאסקים!',
        body: '<p>בשאלות סדר הדפסות: כל ה-Promises וה-queueMicrotask רצים <b>תמיד לפני</b> שהדפדפן נוגע ב-setTimeout או setInterval!</p>'
      },
      {
        h: 'השמטת תלויות ב-useEffect — Stale Closures',
        body: '<p>אם אתם קוראים למשתנה מה-state או prop בתוך <code dir="ltr">useEffect</code> ולא מכניסים אותו למערך התלויות, הפונקציה תראה לעד את הערך הישן (Stale Closure)!</p>'
      },
      {
        h: 'אידמפוטנטיות ב-REST: POST לעומת PUT',
        body: '<p>שאלה קלאסית בבחינה: <b>POST אינו אידמפוטנטי</b> (כל קריאה תיצור רשומה חדשה בדאטה-בייס). <b>PUT ו-DELETE הן אידמפוטנטיות</b> (חזרה על הפעולה 10 פעמים מותירה את המערכת בדיוק באותו מצב).</p>'
      },
      {
        h: 'שמירה על Immutability ב-React State',
        body: '<p>לעולם אל תבצעו <code dir="ltr">items.push(newItem)</code>! תמיד צרו עותק חדש: <code dir="ltr">setItems([...items, newItem])</code>. אחרת React לא תזהה שינוי רפרנס ולא תבצע רינדור מחדש.</p>'
      }
    ]
  },
  examsData: {
    methodology: { denominator: 8, topLevelQuestionCount: 64, recentDenominator: 4 },
    exams: [
      { id: 'web-2025a-a', name: 'בחינה בפיתוח אפליקציות אינטרנט 2025 סמסטר א׳ מועד א׳', year: 2025, term: 'א׳', moed: 'א׳', group: 'main-paper', questions: ['WEB-01'] },
      { id: 'web-2025b-b', name: 'בחינה בפיתוח אפליקציות אינטרנט 2025 סמסטר ב׳ מועד ב׳', year: 2025, term: 'ב׳', moed: 'ב׳', group: 'main-paper', questions: ['WEB-02'] }
    ],
    frequency: [
      { topic: 'react-hooks', examCount: 8, denominator: 8 },
      { topic: 'js-async', examCount: 7, denominator: 8 },
      { topic: 'backend-rest', examCount: 6, denominator: 8 },
      { topic: 'react-core', examCount: 6, denominator: 8 }
    ],
    recentFrequency: [
      { topic: 'react-hooks', examCount: 4, denominator: 4 },
      { topic: 'js-async', examCount: 3, denominator: 4 },
      { topic: 'backend-rest', examCount: 3, denominator: 4 },
      { topic: 'react-core', examCount: 3, denominator: 4 }
    ],
    year2026Frequency: [
      { topic: 'react-hooks', examCount: 1, denominator: 1 },
      { topic: 'js-async', examCount: 1, denominator: 1 }
    ]
  },
  syllabusData: {
    topics: [
      { id: 'js-async', name: 'JavaScript, אסינכרוניות ו-Event Loop', subtopics: ['Closures', 'Promises', 'Microtasks'] },
      { id: 'react-core', name: 'React: רכיבים ו-State', subtopics: ['Virtual DOM', 'Immutability', 'Reconciliation'] },
      { id: 'react-hooks', name: 'React Hooks מתקדמים', subtopics: ['useEffect', 'useRef', 'Cleanup'] },
      { id: 'backend-rest', name: 'Node.js, Express ו-REST APIs', subtopics: ['Routing', 'Middleware', 'HTTP Codes'] }
    ],
    notInSyllabus: ['GraphQL', 'Kubernetes']
  },
  patternsData: {
    patterns: [
      { id: 'p1', name: 'מימוש רכיב React עם Custom Hook וקריאת שרת', priority: 'A', examCount: 8, denominator: 8, method: 'הפרדת לוגיקת ה-fetching ל-Hook ייעודי, טיפול ב-loading, error ו-data.', tips: 'זכרו לטפל במקרה של unmount עם AbortController או דגל פעיל.' },
      { id: 'p2', name: 'ניתוח סדר הדפסות ב-Event Loop עם Promises ו-setTimeout', priority: 'A', examCount: 7, denominator: 8, method: 'מעקב שלב אחר שלב: ריצת קוד סינכרוני, ריקון תור ה-microtasks, ורק אז מעבר ל-macrotask.', tips: 'קוד בתוך גוף הבנאי של Promise רץ סינכרונית מיד!' }
    ]
  }
};
