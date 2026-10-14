/* =======================================================================
   assets/viz.js — המחשות אינטראקטיביות
   כל ההמחשות מריצות את האלגוריתם בפועל ומצלמות את המצב בכל צעד,
   לפי המוסכמות של הקורס: אינדקסים מ-1, ערימת מקסימום,
   Partition בגרסת Hoare, ומחיקה מ-BST דרך העוקב.
   ======================================================================= */
(function () {
"use strict";
var VIZ = window.VIZ = { list: [], defs: {} };
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ------------------------- ציור: מערך ------------------------- */
function arrBox(vals, opt) {
  opt = opt || {};
  var hi = opt.hi || {}, base = opt.base == null ? 1 : opt.base;
  var h = '<div class="arrrow">';
  vals.forEach(function (v, i) {
    var cls = hi[i + base] || "";
    h += '<div><div class="arrcell ' + cls + '">' + (v === null || v === undefined ? "—" : esc(v)) +
      '</div><div class="arridx">' + (i + base) + "</div></div>";
  });
  return h + "</div>";
}

/* ------------------------- ציור: רשימה מקושרת ------------------------- */
function listSVG(nodes, opt) {
  opt = opt || {};
  var hi = opt.hi || {}, ptr = opt.ptr || {}, cut = opt.cut || {}, extra = opt.extra || {};
  var w = 96, gap = 34, H = 150, y = 74;
  var W = nodes.length * (w + gap) + 60;
  var s = '<svg class="vzsvg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" style="direction:ltr">';
  s += '<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">' +
    '<path d="M0,0 L8,4 L0,8 z" fill="#5674bd"/></marker>' +
    '<marker id="ahr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">' +
    '<path d="M0,0 L8,4 L0,8 z" fill="#b63e4e"/></marker></defs>';
  nodes.forEach(function (n, i) {
    var x = 30 + i * (w + gap);
    var col = hi[i] === "hi" ? "#dfe8ff" : hi[i] === "hi2" ? "#dcf6ee" : "#ffffff";
    var bc = hi[i] === "hi" ? "#4365b7" : hi[i] === "hi2" ? "#198772" : "#dce2ed";
    s += '<rect x="' + x + '" y="' + (y - 22) + '" width="' + w + '" height="44" rx="8" fill="' + col + '" stroke="' + bc + '"/>';
    s += '<line x1="' + (x + w - 26) + '" y1="' + (y - 22) + '" x2="' + (x + w - 26) + '" y2="' + (y + 22) + '" stroke="' + bc + '"/>';
    s += '<text x="' + (x + (w - 26) / 2) + '" y="' + (y + 5) + '" fill="#20304d" text-anchor="middle">' + esc(n) + "</text>";
    if (extra[i]) s += '<text x="' + (x + w / 2) + '" y="' + (y + 40) + '" fill="#b07cf5" text-anchor="middle" font-size="11">' + esc(extra[i]) + "</text>";
    if (i < nodes.length - 1) {
      var broken = cut[i];
      s += '<line x1="' + (x + w - 13) + '" y1="' + y + '" x2="' + (x + w + gap - 4) + '" y2="' + y +
        '" stroke="' + (broken ? "#b63e4e" : "#5674bd") + '" stroke-width="2"' +
        (broken ? ' stroke-dasharray="4 3"' : "") + ' marker-end="url(#' + (broken ? "ahr" : "ah") + ')"/>';
    } else {
      s += '<text x="' + (x + w + 8) + '" y="' + (y + 5) + '" fill="#64748b" font-size="12">nil</text>';
    }
    if (ptr[i]) {
      s += '<text x="' + (x + w / 2) + '" y="' + (y - 34) + '" fill="#93641a" text-anchor="middle" font-size="12">' + esc(ptr[i]) + "</text>";
      s += '<line x1="' + (x + w / 2) + '" y1="' + (y - 30) + '" x2="' + (x + w / 2) + '" y2="' + (y - 24) +
        '" stroke="#93641a" stroke-width="2"/>';
    }
  });
  return s + "</svg>";
}

/* ------------------------- ציור: עץ ------------------------- */
function clone(n) { return n ? { k: n.k, l: clone(n.l), r: clone(n.r), f: n.f } : null; }
function treeSVG(root, opt) {
  opt = opt || {};
  var hi = opt.hi || {};
  if (!root) return '<div class="empty">העץ ריק</div>';
  var nodes = [], i = 0, maxD = 0;
  (function go(n, d) {
    if (!n) return;
    go(n.l, d + 1); n._x = i++; n._y = d; maxD = Math.max(maxD, d); nodes.push(n); go(n.r, d + 1);
  })(root, 0);
  var dx = 52, dy = 62, pad = 34;
  var W = (i) * dx + pad * 2, H = (maxD + 1) * dy + pad * 2;
  function X(n) { return pad + n._x * dx; }
  function Y(n) { return pad + n._y * dy; }
  var s = '<svg class="vzsvg" viewBox="0 0 ' + W + " " + H + '" width="' + Math.min(W, 860) + '" style="direction:ltr">';
  nodes.forEach(function (n) {
    ["l", "r"].forEach(function (side) {
      if (n[side]) s += '<line x1="' + X(n) + '" y1="' + Y(n) + '" x2="' + X(n[side]) + '" y2="' + Y(n[side]) +
        '" stroke="#dce2ed" stroke-width="1.6"/>';
    });
  });
  nodes.forEach(function (n) {
    var st = hi[n.k];
    var fill = st === "hi" ? "#dfe8ff" : st === "ok" ? "#dcf6ee" : st === "bad" ? "#4a1119" : st === "new" ? "#3a1f66" : "#ffffff";
    var stroke = st === "hi" ? "#4365b7" : st === "ok" ? "#198772" : st === "bad" ? "#b63e4e" : st === "new" ? "#b07cf5" : "#dce2ed";
    s += '<circle cx="' + X(n) + '" cy="' + Y(n) + '" r="17" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.8"/>';
    s += '<text x="' + X(n) + '" y="' + (Y(n) + 4) + '" fill="#20304d" text-anchor="middle">' + esc(n.k) + "</text>";
    if (n.f != null && n.f !== "") s += '<text x="' + (X(n) + 21) + '" y="' + (Y(n) - 13) +
      '" fill="#93641a" font-size="10.5" text-anchor="start">' + esc(n.f) + "</text>";
  });
  return s + "</svg>";
}

/* ------------------------- מנוע ההרצה ------------------------- */
function def(o) { VIZ.defs[o.id] = o; VIZ.list.push(o); }
function S(stage, exp, keep, line, cnt) {
  return { stage: stage, exp: exp, keep: keep, line: line, cnt: cnt };
}

VIZ.mount = function (id, el) {
  var d = VIZ.defs[id];
  if (!d) { el.innerHTML = ""; return; }
  var steps = d.build();
  var i = 0;
  el.innerHTML =
    '<div class="viz" id="viz-' + id + '">' +
    '<div class="vizhead"><span class="vt">' + esc(d.title) + "</span>" +
    '<span class="tag pur">הדמיה לימודית</span>' +
    (d.tag ? '<span class="tag blu">' + esc(d.tag) + "</span>" : "") + "</div>" +
    (d.sub ? '<p style="margin:0 0 10px;color:var(--txt2);font-size:14.3px">' + d.sub + "</p>" : "") +
    '<div class="vizstage" aria-live="polite"></div>' +
    '<div class="vizexp"></div>' +
    (d.code ? '<div class="vizcode">' + d.code.map(function (l, n) {
      return '<div data-l="' + n + '">' + esc(l) + "</div>";
    }).join("") + "</div>" : "") +
    '<div class="vizctl noprint">' +
    '<button class="btn sm" data-a="rst" type="button">⟲ איפוס</button>' +
    '<button class="btn sm" data-a="prev" type="button">→ צעד אחורה</button>' +
    '<button class="btn sm pri" data-a="next" type="button">צעד קדימה ←</button>' +
    '<button class="btn sm" data-a="end" type="button">לסוף</button>' +
    (d.cnt ? '<span class="counter" data-cnt></span>' : "") +
    '<span class="step" data-step></span></div>' +
    (d.cnt ? '<p style="font-size:12.5px;color:var(--txt3);margin:8px 0 0">מונה הפעולות סופר: <b>' + esc(d.cnt) +
      "</b>. זו הדגמה של ההתנהגות בדוגמה אחת — <b>אינה הוכחה לחסם אסימפטוטי</b>.</p>" : "") +
    (d.src ? '<div class="src">' + esc(d.src) + "</div>" : "") +
    "</div>";

  var stage = el.querySelector(".vizstage"), exp = el.querySelector(".vizexp");
  var stepEl = el.querySelector("[data-step]"), cntEl = el.querySelector("[data-cnt]");
  var codeEl = el.querySelector(".vizcode");

  function draw() {
    var s = steps[i];
    stage.innerHTML = s.stage;
    exp.innerHTML = s.exp + (s.keep ? '<span class="keep">תכונה שנשמרת: ' + s.keep + "</span>" : "");
    stepEl.textContent = "צעד " + (i + 1) + " מתוך " + steps.length;
    if (cntEl) cntEl.textContent = (d.cnt ? "מונה: " + (s.cnt == null ? 0 : s.cnt) : "");
    if (codeEl) {
      Array.prototype.forEach.call(codeEl.children, function (c, n) {
        c.classList.toggle("act", s.line != null && n === s.line);
      });
    }
    el.querySelector('[data-a="prev"]').disabled = i === 0;
    el.querySelector('[data-a="next"]').disabled = i === steps.length - 1;
  }
  el.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-a]"); if (!b) return;
    var a = b.getAttribute("data-a");
    if (a === "next" && i < steps.length - 1) i++;
    else if (a === "prev" && i > 0) i--;
    else if (a === "rst") i = 0;
    else if (a === "end") i = steps.length - 1;
    draw();
  });
  draw();
};

/* =====================================================================
   1. רשימה מקושרת — הכנסה ומחיקה: מה בדיוק קורה למצביעים
   ===================================================================== */
def({
  id: "list-ins", topic: "list", title: "רשימה חד־מקושרת — הכנסה ומחיקה",
  tag: "מוסכמות הקורס: Insert לראש הרשימה",
  sub: "המצגת מגדירה <code dir=\"ltr\">List-Insert</code> שמכניסה <b>לראש</b> ב-O(1), ו-<code dir=\"ltr\">List-Delete</code> שמקבלת מצביע לצומת. ההמחשה מראה למה מחיקה ברשימה חד־מקושרת דורשת את הקודם — ולכן O(n) אם נתון רק מפתח.",
  src: "מצגת 5 - רשימה מקושרת ועצים בינריים, שקופיות List-Insert / List-Delete",
  cnt: "פעולות עדכון מצביע (השמה ל-next או ל-head)",
  code: ["List-Insert(L, x)", " 1  next[x] <- head[L]", " 2  head[L] <- x", "",
         "List-Delete(L, k)", " 3  p <- head[L]; prev <- nil", " 4  while p != nil and key[p] != k", " 5      prev <- p; p <- next[p]", " 6  if p = nil then return", " 7  if prev = nil then head[L] <- next[p]", " 8  else next[prev] <- next[p]"],
  build: function () {
    var st = [], c = 0;
    st.push(S(listSVG(["17", "9", "4"], { ptr: { 0: "head" } }),
      "מצב התחלתי: רשימה באורך 3. <code dir=\"ltr\">head</code> מצביע על הצומת הראשון, והאחרון מצביע ל-<code dir=\"ltr\">nil</code>.",
      "כל צומת מוחזק ע\"י בדיוק מצביע אחד — אין דליפה ואין מעגל.", null, c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 0: "hi" }, ptr: { 0: "x", 1: "head" }, cut: { 0: true } }),
      "<b>Insert(25):</b> שורה 1 — <code dir=\"ltr\">next[x] ← head[L]</code>. הצומת החדש מצביע כבר על הראשון, אבל <code dir=\"ltr\">head</code> עדיין מצביע על 17. <b>זה הרגע המסוכן</b> — שתי הכתובות קיימות במקביל.",
      "אחרי השורה הזו הרשימה עדיין תקינה דרך head — לא איבדנו כלום.", 1, ++c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 0: "hi2" }, ptr: { 0: "head" } }),
      "שורה 2 — <code dir=\"ltr\">head[L] ← x</code>. ההכנסה הושלמה ב-<b>שתי</b> פעולות, בלי תלות באורך הרשימה.",
      "סדר הצמתים נשמר; אורך הרשימה גדל ב-1. סיבוכיות: <code dir=\"ltr\">O(1)</code> במקרה הגרוע.", 2, ++c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 0: "hi" }, ptr: { 0: "p" } }),
      "<b>Delete(9):</b> שורה 3 — מתחילים לחפש מהראש. <code dir=\"ltr\">p=25, prev=nil</code>.",
      "החיפוש אינו משנה את הרשימה.", 5, c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 1: "hi" }, ptr: { 0: "prev", 1: "p" } }),
      "שורות 4–5 — <code dir=\"ltr\">key[p]=25≠9</code>, מתקדמים: <code dir=\"ltr\">prev←p, p←next[p]</code>. " +
      "שים לב: אנחנו <b>חייבים</b> לגרור את <code dir=\"ltr\">prev</code> — ברשימה חד־מקושרת אין דרך לחזור אחורה.",
      "", 6, c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 2: "hi" }, ptr: { 1: "prev", 2: "p" } }),
      "עוד איטרציה: <code dir=\"ltr\">p</code> על 9 — מצאנו. <code dir=\"ltr\">prev</code> על 17.",
      "", 6, c));
    st.push(S(listSVG(["25", "17", "9", "4"], { hi: { 2: "bad" }, ptr: { 1: "prev", 2: "p" }, cut: { 1: true, 2: true } }),
      "שורה 8 — <code dir=\"ltr\">next[prev] ← next[p]</code>. מצביע אחד משתנה, והצומת 9 יוצא מהרשימה.",
      "הרשימה נשארת רציפה: 25 → 17 → 4 → nil.", 10, ++c));
    st.push(S(listSVG(["25", "17", "4"], { ptr: { 0: "head" } }),
      "המצב הסופי. <b>המסקנה למבחן:</b> החיפוש הוא O(n) והניתוק עצמו O(1). " +
      "לכן <code dir=\"ltr\">Delete(מצביע)</code> ברשימה דו־מקושרת הוא O(1), אבל ברשימה חד־מקושרת גם מצביע לא מספיק — צריך את הקודם.",
      "אורך הרשימה קטן ב-1, הסדר היחסי נשמר.", null, c));
    return st;
  }
});

/* =====================================================================
   2. היפוך רשימה — דפוס שלושת המצביעים
   ===================================================================== */
def({
  id: "list-rev", topic: "list", title: "היפוך רשימה במקום — דפוס שלושת המצביעים",
  sub: "הדפוס שמופיע בכל שאלה שכתוב בה «בזיכרון O(1)» או «בלי מבנה נתונים נוסף». שלושה מצביעים בלבד, מעבר אחד.",
  src: "דפוס מתוך שאלות רשימה במבחנים (2023 ב׳ מועד ב׳, 2025 א׳ מועד א׳); הפסאודו־קוד בסגנון מצגת 5",
  cnt: "מספר האיטרציות של הלולאה (= מספר הצמתים שהופכו)",
  code: ["Reverse(L)", " 1  prev <- nil", " 2  cur  <- head[L]", " 3  while cur != nil", " 4      nxt <- next[cur]", " 5      next[cur] <- prev", " 6      prev <- cur", " 7      cur  <- nxt", " 8  head[L] <- prev"],
  build: function () {
    var st = [], vals = ["3", "7", "2", "8"], c = 0;
    st.push(S(listSVG(vals, { ptr: { 0: "head, cur" } }),
      "מצב התחלתי. <code dir=\"ltr\">prev = nil</code>, <code dir=\"ltr\">cur = head</code>.",
      "כל הצמתים עדיין מקושרים בכיוון המקורי.", 2, c));
    var revd = [], rest = vals.slice();
    for (var k = 0; k < vals.length; k++) {
      var cur = rest.shift();
      revd.unshift(cur);
      c++;
      var shown = revd.slice().reverse().concat(rest);
      var ptr = {};
      ptr[revd.length - 1] = "prev";
      if (rest.length) ptr[revd.length] = "cur";
      var cut = {}; cut[revd.length - 1] = true;
      st.push(S(listSVG(shown, { ptr: ptr, hi: (function () { var o = {}; o[revd.length - 1] = "hi"; return o; })(), cut: cut }),
        "איטרציה " + (k + 1) + ": שמרנו את <code dir=\"ltr\">nxt=next[cur]</code> (שורה 4), הפכנו את החץ של <b>" + esc(cur) +
        "</b> אחורה (שורה 5), והזזנו את שני המצביעים (שורות 6–7).<br>" +
        "החלק ההפוך: <code dir=\"ltr\">" + revd.join(" → ") + "</code>" +
        (rest.length ? " · נשאר: <code dir=\"ltr\">" + rest.join(" → ") + "</code>" : " · לא נשאר כלום"),
        "בכל רגע: <code dir=\"ltr\">prev</code> הוא ראש החלק ההפוך, <code dir=\"ltr\">cur</code> ראש החלק שלא נגענו בו, ואף צומת לא אבד — כי שמרנו את <code dir=\"ltr\">nxt</code> לפני ששינינו.",
        5, c));
    }
    st.push(S(listSVG(revd.slice().reverse(), { ptr: { 0: "head" } }),
      "שורה 8 — <code dir=\"ltr\">head[L] ← prev</code>. סיימנו.<br><b>ניתוח:</b> זמן <code dir=\"ltr\">Θ(n)</code> (מעבר אחד), מקום <code dir=\"ltr\">O(1)</code> (שלושה מצביעים, ללא תלות ב-n).",
      "אותם n צמתים, בסדר הפוך, בלי שהוקצה זיכרון נוסף.", 8, c));
    return st;
  }
});

/* =====================================================================
   3. מחסנית ותור
   ===================================================================== */
def({
  id: "stack-queue", topic: "stq", title: "מחסנית ותור מעגלי במערך",
  sub: "המחסנית גדלה מהתא הראשון; התור המעגלי מוגדר עם <code dir=\"ltr\">head</code> ו-<code dir=\"ltr\">tail</code> שמתגלגלים מודולו גודל המערך. שימו לב לצעד שבו tail חוזר לתא 1.",
  src: "מצגת 4 - מחסנית ותור (Push/Pop, Enqueue/Dequeue, תור מעגלי)",
  cnt: "מספר פעולות O(1) שבוצעו",
  code: ["Push(S,x):  top[S] <- top[S]+1 ; S[top[S]] <- x",
         "Pop(S):     x <- S[top[S]] ; top[S] <- top[S]-1 ; return x",
         "Enqueue(Q,x): Q[tail] <- x ; tail <- (tail mod n)+1",
         "Dequeue(Q):   x <- Q[head] ; head <- (head mod n)+1 ; return x"],
  build: function () {
    var st = [], c = 0;
    function stack(vals, top, note, hiIdx) {
      var cells = []; for (var i = 0; i < 6; i++) cells.push(i < vals.length ? vals[i] : null);
      var hi = {}; if (hiIdx) hi[hiIdx] = "hi";
      return '<div class="lbl">מחסנית S · top = ' + top + "</div>" + arrBox(cells, { hi: hi });
    }
    st.push(S(stack([], 0), "מחסנית ריקה: <code dir=\"ltr\">top = 0</code>. הבדיקה <code dir=\"ltr\">Stack-Empty</code> היא בדיוק <code dir=\"ltr\">top = 0</code>.",
      "LIFO: האיבר שנכנס אחרון יוצא ראשון.", 0, c));
    st.push(S(stack(["4"], 1, "", 1), "<b>Push(4)</b> — top עולה ל-1 והערך נכתב ל-<code dir=\"ltr\">S[1]</code>.", "", 0, ++c));
    st.push(S(stack(["4", "9"], 2, "", 2), "<b>Push(9)</b> — <code dir=\"ltr\">S[2]←9</code>.", "", 0, ++c));
    st.push(S(stack(["4", "9", "1"], 3, "", 3), "<b>Push(1)</b> — <code dir=\"ltr\">S[3]←1</code>. שלוש פעולות, כל אחת <code dir=\"ltr\">O(1)</code>.",
      "האיברים יושבים ברצף ב-<code dir=\"ltr\">S[1..top]</code>.", 0, ++c));
    st.push(S(stack(["4", "9", "1"], 2, "", 3), "<b>Pop()</b> מחזיר 1 ו-top יורד ל-2. <b>הערך 1 עדיין במערך</b> — אבל הוא מחוץ לתחום <code dir=\"ltr\">S[1..top]</code> ולכן אינו קיים לוגית.",
      "האינווריאנט הוא על <code dir=\"ltr\">top</code>, לא על תוכן המערך.", 1, ++c));

    function queue(cells, head, tail) {
      var hi = {}; hi[head] = "hi"; hi[tail] = "hi2";
      return '<div class="lbl">תור מעגלי Q (n=5) · <span style="color:#4365b7">head=' + head +
        '</span> · <span style="color:#198772">tail=' + tail + "</span></div>" + arrBox(cells, { hi: hi });
    }
    st.push(S(queue([null, null, null, null, null], 1, 1),
      "<b>תור מעגלי</b> בגודל 5. בהתחלה <code dir=\"ltr\">head = tail = 1</code> — התור ריק.",
      "FIFO: היוצא הבא הוא זה שב-head.", 2, c));
    st.push(S(queue(["6", null, null, null, null], 1, 2), "<b>Enqueue(6)</b> — נכתב ל-tail, ו-tail מתקדם.", "", 2, ++c));
    st.push(S(queue(["6", "2", "7", null, null], 1, 4), "<b>Enqueue(2), Enqueue(7)</b> — tail=4.", "", 2, c += 2));
    st.push(S(queue(["6", "2", "7", null, null], 2, 4), "<b>Dequeue()</b> מחזיר 6 (התא ב-head), ו-head מתקדם ל-2.",
      "התא 1 התפנה — וזה בדיוק מה שמאפשר את הגלגול.", 3, ++c));
    st.push(S(queue(["6", "2", "7", "5", "3"], 2, 1),
      "<b>Enqueue(5), Enqueue(3)</b> — tail הגיע ל-5, נכתב, ואז <code dir=\"ltr\">(5 mod 5)+1 = 1</code>. " +
      "<b>tail התגלגל לתא 1</b> — שהתפנה קודם. זה הרעיון של התור המעגלי.",
      "כל הפעולות נשארו <code dir=\"ltr\">O(1)</code> בלי הזזת איברים, וזו הסיבה שלא מממשים תור במערך רגיל.", 2, c += 2));
    return st;
  }
});

/* =====================================================================
   4. סריקות עץ
   ===================================================================== */
function mkTree(arr) { /* arr = מערך של [key, leftIdx, rightIdx] */
  var nodes = arr.map(function (a) { return { k: a[0], l: null, r: null }; });
  arr.forEach(function (a, i) {
    if (a[1] != null) nodes[i].l = nodes[a[1]];
    if (a[2] != null) nodes[i].r = nodes[a[2]];
  });
  return nodes[0];
}
def({
  id: "traversal", topic: "bt", title: "שלוש הסריקות על אותו עץ",
  sub: "אותו עץ, שלושה סדרים. ההבדל היחיד הוא <b>מתי</b> מבקרים בשורש ביחס לשתי הקריאות הרקורסיביות.",
  src: "מצגת 5 — Preorder / Inorder / Postorder-Tree-Walk",
  cnt: "מספר הצמתים שבוקרו (כל צומת מבוקר בדיוק פעם אחת בכל סריקה)",
  code: ["InOrder(x)", " 1  if x != nil", " 2      InOrder(left[x])", " 3      print key[x]", " 4      InOrder(right[x])"],
  build: function () {
    var t = mkTree([[15, 1, 2], [6, 3, 4], [18, 5, 6], [3, null, null], [7, null, 7], [17, null, null], [20, null, null], [13, null, null]]);
    var st = [];
    function walk(order) {
      var out = [];
      (function go(n) {
        if (!n) return;
        if (order === "pre") out.push(n.k);
        go(n.l);
        if (order === "in") out.push(n.k);
        go(n.r);
        if (order === "post") out.push(n.k);
      })(t);
      return out;
    }
    var names = { pre: "Pre-Order — שורש, שמאל, ימין", "in": "In-Order — שמאל, שורש, ימין", post: "Post-Order — שמאל, ימין, שורש" };
    var uses = {
      pre: "שימוש: שכפול עץ, ושחזור עץ בשילוב In-Order. <b>שים לב:</b> בדף הנוסחאות שבתיקייה כתוב «שורש, ראש, שמאל» — זו שגיאה בדף.",
      "in": "שימוש: מדפיסה עץ חיפוש בינארי <b>בסדר עולה</b>. זו ההצדקה למשפט «מיון ע\"י BST».",
      post: "שימוש: חישוב מלמטה למעלה — גובה, מספר צמתים, קוטר, ושחרור זיכרון."
    };
    ["pre", "in", "post"].forEach(function (ord) {
      var seq = walk(ord);
      seq.forEach(function (k, idx) {
        var hi = {};
        seq.slice(0, idx).forEach(function (x) { hi[x] = "ok"; });
        hi[k] = "hi";
        st.push(S('<div class="lbl">' + names[ord] + "</div>" + treeSVG(t, { hi: hi }) +
          '<p class="fml" dir="ltr">' + seq.slice(0, idx + 1).join(" → ") + (idx < seq.length - 1 ? " → …" : "") + "</p>",
          "מבקרים ב-<b>" + k + "</b> (צומת " + (idx + 1) + " מתוך " + seq.length + ").<br>" + uses[ord],
          ord === "in" ? "בכל רגע, הרצף שהודפס עד כה הוא <b>ממוין בסדר עולה</b> — וזו הוכחת הנכונות של In-Order על BST." :
            "כל צומת מבוקר בדיוק פעם אחת ⟹ <code dir=\"ltr\">Θ(n)</code>.",
          ord === "in" ? (idx % 2 === 0 ? 3 : 2) : null, idx + 1));
      });
    });
    return st;
  }
});

/* =====================================================================
   5. הכנסה ל-BST
   ===================================================================== */
function bstInsert(root, k, path) {
  var n = { k: k, l: null, r: null };
  if (!root) return n;
  var cur = root;
  while (true) {
    if (path) path.push(cur.k);
    if (k < cur.k) { if (!cur.l) { cur.l = n; return root; } cur = cur.l; }
    else { if (!cur.r) { cur.r = n; return root; } cur = cur.r; }
  }
}
def({
  id: "bst-ins", topic: "bst", title: "הכנסה לעץ חיפוש בינארי",
  sub: "המפתח יורד מהשורש, פונה שמאלה כשהוא קטן וימינה אחרת, ונתלה כעלה. <b>מוסכמת הקורס:</b> שוויון נשלח ימינה.",
  src: "מצגת 5 — Tree-Insert; תרגול מס׳ 9",
  cnt: "מספר ההשוואות (= אורך המסלול מהשורש)",
  code: ["Tree-Insert(T,z)", " 1  y <- nil ; x <- root[T]", " 2  while x != nil", " 3      y <- x", " 4      if key[z] < key[x] then x <- left[x]", " 5      else x <- right[x]", " 6  p[z] <- y", " 7  if y = nil then root[T] <- z", " 8  else if key[z] < key[y] then left[y] <- z", " 9  else right[y] <- z"],
  build: function () {
    var seq = [12, 5, 18, 2, 9, 15, 19, 13];
    var st = [], root = null, cmp = 0;
    st.push(S('<div class="empty">העץ ריק — נכניס את הסדרה 12, 5, 18, 2, 9, 15, 19, 13</div>',
      "מתחילים מעץ ריק. כל הכנסה מתחילה בשורש.", "תכונת ה-BST: לכל צומת x, כל המפתחות בתת־העץ השמאלי ≤ key[x] ≤ כל המפתחות בתת־העץ הימני.", 0, 0));
    seq.forEach(function (k) {
      var path = [];
      root = bstInsert(root, k, path);
      cmp += path.length;
      var hi = {}; path.forEach(function (p) { hi[p] = "hi"; }); hi[k] = "new";
      st.push(S(treeSVG(root, { hi: hi }),
        "<b>הכנסת " + k + ":</b> " + (path.length ?
          "המסלול שנבדק: <code dir=\"ltr\">" + path.join(" → ") + "</code>. " + path.length + " השוואות, והצומת נתלה כעלה." :
          "העץ היה ריק — הצומת הופך לשורש."),
        "אחרי ההכנסה ה-In-Order של העץ עדיין ממוין, ולכן תכונת ה-BST נשמרה.", 2, cmp));
    });
    st.push(S(treeSVG(root, {}) + '<p class="fml" dir="ltr">In-Order: 2 → 5 → 9 → 12 → 13 → 15 → 18 → 19</p>',
      "<b>המסקנה למבחן:</b> כל הכנסה עולה <code dir=\"ltr\">O(h)</code> — לא <code dir=\"ltr\">O(log n)</code>. " +
      "בעץ הזה h=3 ולכן זה נראה טוב; אבל אילו הכנסנו 2,5,9,12,13,15,18,19 <b>בסדר עולה</b> היינו מקבלים שרשרת ו-h=7. " +
      "זו בדיוק הסיבה ל-AVL.",
      "הסריקה התוכית ממוינת — זו ההגדרה השקולה של BST.", null, cmp));
    return st;
  }
});

/* =====================================================================
   6. מחיקה מ-BST — שלושת המקרים
   ===================================================================== */
def({
  id: "bst-del", topic: "bst", title: "מחיקה מ-BST — שלושת המקרים",
  sub: "מוסכמת הקורס: כשלצומת שני בנים מוחקים את ה<b>עוקב</b> (המינימום בתת־העץ הימני) ומעתיקים את מפתחו. לא ה-predecessor.",
  src: "מצגת 5 — Tree-Delete; שאלת מבחן 2022 ב׳ מועד א׳ שאלה 8",
  code: ["Tree-Delete(T,z)", " 1  if left[z]=nil or right[z]=nil", " 2      y <- z                 // מקרה 1 או 2", " 3  else y <- Tree-Successor(z)   // מקרה 3", " 4  if left[y] != nil then x <- left[y]", " 5  else x <- right[y]", " 6  ... ניתוק y וחיבור x לאב שלו ...", " 7  if y != z then key[z] <- key[y]"],
  build: function () {
    function T() {
      return mkTree([[15, 1, 2], [6, 3, 4], [18, 5, 6], [3, null, null], [9, 7, 8], [17, null, null], [20, null, null], [7, null, null], [13, null, null]]);
    }
    var st = [];
    var t0 = T();
    st.push(S(treeSVG(t0, {}), "העץ ההתחלתי. נבצע שלוש מחיקות — אחת מכל מקרה.",
      "In-Order: 3, 6, 7, 9, 13, 15, 17, 18, 20 — ממוין.", null));
    var t1 = T();
    st.push(S(treeSVG(t1, { hi: { 3: "bad" } }),
      "<b>מקרה 1 — מחיקת עלה (3).</b> אין מה לתקן: מנתקים את הצומת מהאב.", "", 1));
    var t1b = mkTree([[15, 1, 2], [6, null, 3], [18, 4, 5], [9, 6, 7], [17, null, null], [20, null, null], [7, null, null], [13, null, null]]);
    st.push(S(treeSVG(t1b, {}), "אחרי המחיקה. <code dir=\"ltr\">left[6] ← nil</code>. פעולה אחת.",
      "כל שאר המפתחות נשארו במקומם היחסי — תכונת ה-BST לא הופרה.", 6));
    st.push(S(treeSVG(t1b, { hi: { 18: "bad", 17: "hi", 20: "hi" } }),
      "<b>מקרה 2 — צומת עם בן יחיד.</b> נמחק קודם את 17, כדי שלצומת 18 יישאר בן אחד (20).", "", 1));
    var t2 = mkTree([[15, 1, 2], [6, null, 3], [18, null, 4], [9, 5, 6], [20, null, null], [7, null, null], [13, null, null]]);
    st.push(S(treeSVG(t2, { hi: { 18: "bad", 20: "hi" } }),
      "עכשיו ל-18 יש בן יחיד. <b>מחיקת 18:</b> מחברים את האב (15) ישירות לבן (20) — «מדלגים» על הצומת.", "", 5));
    var t2b = mkTree([[15, 1, 2], [6, null, 3], [20, null, null], [9, 4, 5], [7, null, null], [13, null, null]]);
    st.push(S(treeSVG(t2b, {}), "אחרי המחיקה: <code dir=\"ltr\">right[15] ← 20</code>.",
      "תת־העץ הימני של 15 עדיין מכיל רק מפתחות גדולים מ-15.", 6));
    st.push(S(treeSVG(t2b, { hi: { 15: "bad" } }),
      "<b>מקרה 3 — צומת עם שני בנים: מחיקת השורש 15.</b> אסור פשוט להסיר אותו. לפי ההרצאה: מוצאים את ה<b>עוקב</b> — המינימום בתת־העץ הימני.", "", 3));
    st.push(S(treeSVG(t2b, { hi: { 15: "bad", 20: "ok" } }),
      "תת־העץ הימני של 15 הוא הצומת 20 בלבד, ולכן <b>העוקב הוא 20</b>. לעוקב לעולם אין בן שמאלי — ולכן מחיקתו היא תמיד מקרה 1 או 2.",
      "זו הנקודה המרכזית בהוכחת הנכונות של Tree-Delete.", 3));
    var t3 = mkTree([[20, 1, null], [6, null, 2], [9, 3, 4], [7, null, null], [13, null, null]]);
    st.push(S(treeSVG(t3, { hi: { 20: "ok" } }),
      "מעתיקים <code dir=\"ltr\">key[z] ← key[y]</code> (השורש הופך ל-20) ומוחקים את הצומת y מהמקום הישן.<br>" +
      "<b>In-Order אחרי הכול:</b> 6, 7, 9, 13, 20 — עדיין ממוין.",
      "מחיקה שומרת על תכונת ה-BST, ועולה <code dir=\"ltr\">O(h)</code>.", 7));
    st.push(S(treeSVG(t3, {}),
      "<b>מלכודת מבחן:</b> מחיקת x ואז y נותנת עץ <u>שונה</u> ממחיקת y ואז x. אם השאלה נותנת סדר — עקוב אחריו בדיוק.",
      "", null));
    return st;
  }
});

/* =====================================================================
   7. AVL — רוטציות ואיזון
   ===================================================================== */
function avlH(n) { return n ? n.h : -1; }
function avlUpd(n) { n.h = 1 + Math.max(avlH(n.l), avlH(n.r)); n.f = "bf " + (avlH(n.l) - avlH(n.r)); return n; }
function rotR(y) { var x = y.l; y.l = x.r; x.r = y; avlUpd(y); avlUpd(x); return x; }
function rotL(x) { var y = x.r; x.r = y.l; y.l = x; avlUpd(x); avlUpd(y); return y; }
function avlInsert(n, k, log) {
  if (!n) return avlUpd({ k: k, l: null, r: null, h: 0 });
  if (k < n.k) n.l = avlInsert(n.l, k, log); else n.r = avlInsert(n.r, k, log);
  avlUpd(n);
  var bf = avlH(n.l) - avlH(n.r);
  if (bf > 1) {
    if (k < n.l.k) { log.push({ t: "LL", at: n.k, r: 1 }); return rotR(n); }
    log.push({ t: "LR", at: n.k, r: 2 }); n.l = rotL(n.l); return rotR(n);
  }
  if (bf < -1) {
    if (k > n.r.k) { log.push({ t: "RR", at: n.k, r: 1 }); return rotL(n); }
    log.push({ t: "RL", at: n.k, r: 2 }); n.r = rotR(n.r); return rotL(n);
  }
  return n;
}
function cloneAVL(n) { return n ? { k: n.k, h: n.h, f: n.f, l: cloneAVL(n.l), r: cloneAVL(n.r) } : null; }
def({
  id: "avl-ins", topic: "avl", title: "AVL — הכנסת 1..10 וספירת רוטציות",
  tag: "בדיוק השאלה שחזרה ב-2025 א׳ מועד א׳ שאלה 3",
  sub: "הכנסה מונוטונית עולה — התרחיש הגרוע ביותר ל-BST רגיל, וההמחשה הטובה ביותר לאיזון. ליד כל צומת מוצג גורם האיזון <code dir=\"ltr\">bf = h(left) − h(right)</code>.",
  src: "מצגת 5.5 - עצי AVL; בחינת 2025 א׳ מועד א׳ שאלה 3 (הכנסת 1..10 ⟹ בשורש 4)",
  cnt: "מספר הרוטציות. <b>רוטציה כפולה נספרת כשתיים</b> — כך נספר בפתרונות הרשמיים",
  code: ["Insert(x)", " 1  הכנס כמו ב-BST רגיל", " 2  עדכן גבהים במעלה המסלול", " 3  מצא את A = האב הקדמון הנמוך ביותר עם |bf| = 2", " 4  LL -> רוטציה ימנית    RR -> רוטציה שמאלית", " 5  LR -> שמאלית ואז ימנית  RL -> ימנית ואז שמאלית", " 6  אחרי תיקון אחד בהכנסה - העץ מאוזן. עצור."],
  build: function () {
    var st = [], root = null, rot = 0;
    st.push(S('<div class="empty">עץ ריק</div>', "נכניס 1, 2, 3, … , 10 לפי הסדר.",
      "האינווריאנט של AVL: לכל צומת <code dir=\"ltr\">|bf| ≤ 1</code>.", 0, 0));
    for (var k = 1; k <= 10; k++) {
      var log = [];
      root = avlInsert(root, k, log);
      var r = log.reduce(function (a, x) { return a + x.r; }, 0);
      rot += r;
      var hi = {}; hi[k] = "new";
      if (log.length) hi[log[0].at] = "bad";
      st.push(S(treeSVG(cloneAVL(root), { hi: hi }),
        "<b>הכנסת " + k + ":</b> " + (log.length ?
          "האיזון הופר בצומת <b>" + log[0].at + "</b> — מקרה <b>" + log[0].t + "</b> ⟹ " +
          (log[0].r === 2 ? "<b>רוטציה כפולה (נספרת כשתיים)</b>" : "רוטציה בודדת") + "." :
          "האיזון נשמר — אין צורך ברוטציה."),
        "אחרי התיקון כל הצמתים מקיימים <code dir=\"ltr\">|bf| ≤ 1</code>, וגובה תת־העץ חזר לגובה שלפני ההכנסה — ולכן <b>בהכנסה מספיק תיקון אחד</b>.",
        log.length ? (log[0].r === 2 ? 5 : 4) : 2, rot));
    }
    st.push(S(treeSVG(cloneAVL(root), { hi: { 4: "ok" } }),
      "<b>התוצאה:</b> בשורש יושב <b>4</b>, גובה העץ 3, וסך הכול <b>" + rot + " רוטציות</b>.<br>" +
      "השוו: ב-BST רגיל אותה סדרה הייתה נותנת שרשרת בגובה 9. " +
      "<b>שימו לב שהשורש אינו 5</b> (האמצע) — כי העץ אינו שלם. בהכנסת 1..15 כן מתקבל עץ שלם והשורש הוא 8.",
      "<code dir=\"ltr\">h = O(log n)</code> מובטח — זה כל מה ש-AVL קונה לנו.", null, rot));
    return st;
  }
});

/* =====================================================================
   8. ערימה — Heapify ו-Extract-Max
   ===================================================================== */
function heapArr(a, hi, note) {
  var h = '<div class="lbl">' + (note || "מערך הערימה A[1..n]") + "</div>" + arrBox(a, { hi: hi || {} });
  /* ציור העץ המקביל */
  function build(i) {
    if (i > a.length) return null;
    return { k: a[i - 1], l: build(2 * i), r: build(2 * i + 1) };
  }
  var hi2 = {};
  Object.keys(hi || {}).forEach(function (idx) { hi2[a[idx - 1]] = hi[idx]; });
  return h + treeSVG(build(1), { hi: hi2 });
}
def({
  id: "heap-ops", topic: "heap", title: "ערימת מקסימום — Heapify ו-Extract-Max",
  sub: "<code dir=\"ltr\">Heapify(A,i)</code> מניחה ששני תת־העצים כבר ערימות, ומחלחלת ערך יחיד למטה. אינדקסים מ-1: <code dir=\"ltr\">left(i)=2i, right(i)=2i+1</code>.",
  src: "מצגת 6 מעודכנת - ערימה; תרגול 10 - ערימה",
  cnt: "מספר ההחלפות (swap). כל רמה עולה לכל היותר החלפה אחת",
  code: ["Heapify(A,i)", " 1  l <- 2i ; r <- 2i+1", " 2  if l <= size and A[l] > A[i] then largest <- l else largest <- i",
         " 3  if r <= size and A[r] > A[largest] then largest <- r", " 4  if largest != i", " 5      swap A[i] <-> A[largest]", " 6      Heapify(A, largest)"],
  build: function () {
    var st = [], sw = 0;
    var a = [4, 14, 7, 2, 8, 1];
    st.push(S(heapArr(a.slice(), { 1: "hi" }),
      "<b>Heapify(A,1):</b> השורש 4 מפר את תכונת הערימה, אבל שני תת־העצים שלו כבר ערימות תקינות. זו הנחת היסוד של השגרה.",
      "כל תת־עץ פרט לשורש מקיים <code dir=\"ltr\">key[child] ≤ key[parent]</code>.", 0, sw));
    st.push(S(heapArr(a.slice(), { 1: "hi", 2: "hi2", 3: "hi2" }),
      "שורות 1–3: הבנים הם <code dir=\"ltr\">A[2]=14</code> ו-<code dir=\"ltr\">A[3]=7</code>. הגדול מביניהם ומהאב הוא 14 ⟹ <code dir=\"ltr\">largest = 2</code>.",
      "", 2, sw));
    var b = [14, 4, 7, 2, 8, 1]; sw++;
    st.push(S(heapArr(b.slice(), { 1: "ok", 2: "hi" }),
      "שורה 5: החלפה. עכשיו השורש תקין — אבל ייתכן שהפרנו את התכונה למטה, ולכן קוראים רקורסיבית ל-<code dir=\"ltr\">Heapify(A,2)</code>.",
      "השורש כבר גדול משני בניו.", 5, sw));
    st.push(S(heapArr(b.slice(), { 2: "hi", 4: "hi2", 5: "hi2" }),
      "<code dir=\"ltr\">Heapify(A,2)</code>: הבנים הם <code dir=\"ltr\">A[4]=2</code> ו-<code dir=\"ltr\">A[5]=8</code>. הגדול הוא 8 ⟹ החלפה.",
      "", 3, sw));
    var c = [14, 8, 7, 2, 4, 1]; sw++;
    st.push(S(heapArr(c.slice(), { 2: "ok", 5: "ok" }),
      "אחרי ההחלפה, לצומת 5 אין בנים — הרקורסיה נעצרת. <b>הערימה תקינה.</b><br>" +
      "המסלול היה בדיוק בגובה העץ ⟹ <code dir=\"ltr\">O(log n)</code>.",
      "כל צומת ≥ שני בניו. <b>שימו לב:</b> אין שום יחס מובטח בין אחים — 8 ו-7 יכלו להיות בכל סדר.", 6, sw));
    st.push(S(heapArr(c.slice(), { 1: "hi", 6: "hi2" }),
      "<b>Extract-Max:</b> מחזירים את <code dir=\"ltr\">A[1]=14</code>, מעבירים את האיבר האחרון (<code dir=\"ltr\">A[6]=1</code>) לשורש, מקטינים את size ב-1…",
      "", null, sw));
    var d = [1, 8, 7, 2, 4]; sw++;
    st.push(S(heapArr(d.slice(), { 1: "hi" }), "…ומפעילים <code dir=\"ltr\">Heapify(A,1)</code>. השורש 1 קטן מבניו ⟹ מחלחל.",
      "צורת העץ נשמרת כמעט־שלמה — כי הסרנו בדיוק את העלה האחרון.", 0, sw));
    var e = [8, 4, 7, 2]; sw += 2;
    st.push(S(heapArr(e.slice(), { 1: "ok" }),
      "אחרי שני חילחולים: הערימה תקינה והמקסימום החדש הוא 8.<br>" +
      "<b>ניתוח:</b> <code dir=\"ltr\">Extract-Max = O(log n)</code> במקרה הגרוע.",
      "שתי התכונות מתקיימות שוב: צורה כמעט־שלמה + כל אב ≥ בניו.", null, sw));
    return st;
  }
});

/* =====================================================================
   9. Build-Heap
   ===================================================================== */
def({
  id: "build-heap", topic: "heap", title: "Build-Heap — ולמה זה Θ(n) ולא Θ(n log n)",
  sub: "רצים מ-<code dir=\"ltr\">⌊n/2⌋</code> ל-1 ומפעילים Heapify. <b>העלים כבר ערימות בגודל 1</b> ולכן מדלגים עליהם — וזה חצי מהמערך.",
  src: "מצגת 6 — Build-Heap והניתוח ההדוק; תרגול 10 — הוכחת סכום הגבהים",
  cnt: "מספר ההחלפות בפועל בדוגמה הזו",
  code: ["Build-Heap(A)", " 1  size <- length[A]", " 2  for i <- floor(n/2) downto 1", " 3      Heapify(A,i)"],
  build: function () {
    var st = [], sw = 0;
    var a = [3, 9, 2, 1, 4, 5];
    var n = a.length;
    st.push(S(heapArr(a.slice(), { 4: "hi2", 5: "hi2", 6: "hi2" }),
      "מערך שרירותי בגודל 6. <b>התאים 4,5,6 הם עלים</b> — כל אחד מהם הוא כבר ערימה תקינה בגודל 1. " +
      "לכן הלולאה מתחילה ב-<code dir=\"ltr\">i = ⌊6/2⌋ = 3</code>.",
      "", 1, sw));
    function heapifyStep(arr, i, size) {
      var swaps = [];
      while (true) {
        var l = 2 * i, r = 2 * i + 1, big = i;
        if (l <= size && arr[l - 1] > arr[big - 1]) big = l;
        if (r <= size && arr[r - 1] > arr[big - 1]) big = r;
        if (big === i) break;
        var t = arr[i - 1]; arr[i - 1] = arr[big - 1]; arr[big - 1] = t;
        swaps.push([i, big]);
        i = big;
      }
      return swaps;
    }
    [3, 2, 1].forEach(function (i) {
      var before = a.slice();
      var sws = heapifyStep(a, i, n);
      sw += sws.length;
      var hi = {}; hi[i] = "hi";
      if (2 * i <= n) hi[2 * i] = "hi2";
      if (2 * i + 1 <= n) hi[2 * i + 1] = "hi2";
      st.push(S(heapArr(before, hi),
        "<b>Heapify(A," + i + "):</b> משווים את <code dir=\"ltr\">A[" + i + "]=" + before[i - 1] + "</code> לבניו. " +
        (sws.length ? sws.length + " החלפה/ות." : "אין צורך בהחלפה."),
        "לפני הקריאה: שני תת־העצים של " + i + " כבר ערימות — זו הסיבה שהלולאה רצה <b>אחורה</b>.", 3, sw));
      st.push(S(heapArr(a.slice(), (function () { var o = {}; o[i] = "ok"; return o; })()),
        "אחרי Heapify(A," + i + "): תת־העץ ששורשו " + i + " הוא ערימה תקינה.",
        "אינווריאנט הלולאה: בתחילת כל איטרציה, כל הצמתים <code dir=\"ltr\">i+1, …, n</code> הם שורשי ערימות.", 3, sw));
    });
    st.push(S(heapArr(a.slice(), {}) +
      '<div class="card"><div class="ttl">למה Θ(n)</div>' +
      '<p>לצומת בגובה h, Heapify עולה <code dir="ltr">O(h)</code>. מספר הצמתים בגובה h הוא לכל היותר <code dir="ltr">⌈n/2^(h+1)⌉</code>. לכן:</p>' +
      '<p class="fml" dir="ltr">Σ_{h=0..⌊log n⌋} ⌈n/2^(h+1)⌉ · O(h) = O( n · Σ_{h=0..∞} h/2^h ) = O(2n) = O(n)</p>' +
      "<p>הסכום <code dir=\"ltr\">Σ h/2^h</code> מתכנס ל-2 — זה כל הטריק. <b>החסם O(n log n) גם נכון, אבל אינו הדוק</b>, " +
      "והערה בכל שאלון אומרת שיש להחזיר את התשובה הטובה ביותר.</p></div>",
      "<b>המערך הפך לערימה ב-" + sw + " החלפות בלבד.</b> " +
      "אבל " + sw + " הוא מספר בדוגמה אחת בגודל 6 — הוא <u>ממחיש</u> ואינו מוכיח. ההוכחה היא חישוב הסכום שמעל.",
      "המערך כולו מקיים את תכונת הערימה.", null, sw));
    return st;
  }
});

/* =====================================================================
   10. מיון מהיר — Partition בגרסת Hoare
   ===================================================================== */
def({
  id: "partition", topic: "qs", title: "Partition בגרסת Hoare — כפי שנלמד בקורס",
  tag: "לא Lomuto",
  sub: "איבר החלוקה הוא <b>הראשון</b> <code dir=\"ltr\">x = A[p]</code>, שני אינדקסים נעים זה לקראת זה, והשגרה <b>מחזירה j</b>. הקריאה השמאלית היא <code dir=\"ltr\">Quick-Sort(A,p,q)</code> — כלומר q נכלל בה.",
  src: "מצגת 3 - מיון מהיר חציון ובחירה; שאלות 2018 ב׳ א׳ ש׳6 ו-2024 קיץ ב׳ ש׳7",
  cnt: "מספר ההחלפות",
  code: ["Partition(A,p,r)", " 1  x <- A[p] ; i <- p-1 ; j <- r+1", " 2  while true", " 3      repeat j <- j-1 until A[j] <= x", " 4      repeat i <- i+1 until A[i] >= x", " 5      if i < j then swap A[i] <-> A[j]", " 6      else return j"],
  build: function () {
    var A = [5, 3, 8, 1, 9, 2, 7];
    var st = [], sw = 0;
    function show(arr, i, j, note) {
      var hi = {};
      hi[1] = "hi2";
      if (i >= 1 && i <= arr.length) hi[i] = "hi";
      if (j >= 1 && j <= arr.length) hi[j] = "hi";
      return '<div class="lbl">x = A[1] = ' + arr[0] + ' · <span style="color:#4365b7">i=' + i + " · j=" + j + "</span></div>" +
        arrBox(arr, { hi: hi }) + (note ? '<p style="text-align:center;color:var(--txt3);font-size:13px">' + note + "</p>" : "");
    }
    var a = A.slice();
    st.push(S(show(a, 0, 8), "איבר החלוקה הוא <code dir=\"ltr\">x = A[1] = 5</code>. האינדקסים מתחילים <b>מחוץ</b> למערך: <code dir=\"ltr\">i=0, j=8</code>.",
      "אין עדיין חלוקה — המערך שלם.", 1, sw));
    st.push(S(show(a, 0, 6), "שורה 3: j יורד עד שמוצא ערך ≤ 5. <code dir=\"ltr\">A[7]=7 > 5</code>, ממשיכים; <code dir=\"ltr\">A[6]=2 ≤ 5</code> ⟹ <b>j=6</b>.", "", 3, sw));
    st.push(S(show(a, 1, 6), "שורה 4: i עולה עד שמוצא ערך ≥ 5. <code dir=\"ltr\">A[1]=5 ≥ 5</code> ⟹ <b>i=1</b> מיד. " +
      "(שימו לב: התנאי הוא ≥, ולכן הציר עצמו עוצר את i.)", "", 4, sw));
    a = [2, 3, 8, 1, 9, 5, 7]; sw++;
    st.push(S(show(a, 1, 6), "שורה 5: <code dir=\"ltr\">i=1 < j=6</code> ⟹ מחליפים <code dir=\"ltr\">A[1]↔A[6]</code>.",
      "כל מה שמשמאל ל-i הוא ≤ x, וכל מה שמימין ל-j הוא ≥ x.", 5, sw));
    st.push(S(show(a, 2, 4), "סיבוב נוסף: j יורד ל-4 (<code dir=\"ltr\">A[4]=1 ≤ 5</code>), i עולה ל-2? " +
      "<code dir=\"ltr\">A[2]=3 < 5</code> ⟹ ממשיך ל-3: <code dir=\"ltr\">A[3]=8 ≥ 5</code> ⟹ <b>i=3</b>.", "", 4, sw));
    st.push(S(show(a, 3, 4), "כעת <code dir=\"ltr\">i=3 < j=4</code> ⟹ החלפה של <code dir=\"ltr\">A[3]=8</code> עם <code dir=\"ltr\">A[4]=1</code>.", "", 5, sw));
    a = [2, 3, 1, 8, 9, 5, 7]; sw++;
    st.push(S(show(a, 3, 4), "אחרי ההחלפה.", "השמאל ≤ x, הימין ≥ x.", 5, sw));
    st.push(S(show(a, 4, 3), "סיבוב אחרון: j יורד ל-3 (<code dir=\"ltr\">A[3]=1 ≤ 5</code>), i עולה ל-4 (<code dir=\"ltr\">A[4]=8 ≥ 5</code>). " +
      "עכשיו <code dir=\"ltr\">i=4 > j=3</code> ⟹ שורה 6: <b>return j = 3</b>.", "", 6, sw));
    st.push(S('<div class="lbl">התוצאה: החלוקה סביב q=3</div>' +
      arrBox(a, { hi: { 1: "hi2", 2: "hi2", 3: "hi2" } }) +
      '<p class="fml" dir="ltr">Quick-Sort(A,1,3)  |  Quick-Sort(A,4,7)</p>',
      "<b>מה שחשוב למבחן:</b> Partition של Hoare <u>אינו</u> שם את הציר במקומו הסופי. " +
      "הוא רק מבטיח ש-<code dir=\"ltr\">A[p..j] ≤ A[j+1..r]</code>. לכן הקריאה השמאלית היא <code dir=\"ltr\">(p,q)</code> ולא <code dir=\"ltr\">(p,q−1)</code>.",
      "כל איבר בחלק השמאלי ≤ כל איבר בחלק הימני. <b>זו כל ההבטחה</b> — ובדיוק ממנה נובעת נכונות מיון מהיר באינדוקציה.", 6, sw));
    return st;
  }
});

/* =====================================================================
   11. מיון מנייה
   ===================================================================== */
def({
  id: "counting", topic: "lin", title: "מיון מנייה (Counting Sort) — ולמה הוא יציב",
  sub: "שלושה שלבים: ספירה, צבירה, ואז מעבר על A <b>מהסוף להתחלה</b>. הכיוון הזה הוא בדיוק מה שהופך את המיון ליציב.",
  src: "מצגת 7 - מיון בזמן לינארי",
  cnt: "מספר הפעולות על מערך המונים C",
  code: ["Counting-Sort(A,B,k)", " 1  for i <- 1 to k: C[i] <- 0",
         " 2  for j <- 1 to n: C[A[j]] <- C[A[j]] + 1", " 3  for i <- 2 to k: C[i] <- C[i] + C[i-1]",
         " 4  for j <- n downto 1", " 5      B[C[A[j]]] <- A[j]", " 6      C[A[j]] <- C[A[j]] - 1"],
  build: function () {
    var A = [3, 1, 4, 1, 3, 2], k = 4, st = [], ops = 0;
    st.push(S('<div class="lbl">A (הקלט) · n=6, k=4</div>' + arrBox(A),
      "המפתחות הם שלמים בתחום <code dir=\"ltr\">[1,4]</code>. <b>זו ההנחה שמתירה לעקוף את החסם Ω(n log n)</b> — אין כאן השוואות בין מפתחות.",
      "", 0, ops));
    var C = [0, 0, 0, 0];
    A.forEach(function (v) { C[v - 1]++; ops++; });
    st.push(S('<div class="lbl">A</div>' + arrBox(A) + '<div class="lbl">C אחרי הספירה</div>' + arrBox(C),
      "שורה 2: <code dir=\"ltr\">C[i]</code> = כמה פעמים מופיע הערך i. סכום התאים = 6 = n ✓",
      "<code dir=\"ltr\">Σ C[i] = n</code> — בדיקה מהירה שלא פספסנו.", 2, ops));
    var Cc = C.slice();
    for (var i = 1; i < k; i++) { Cc[i] += Cc[i - 1]; ops++; }
    st.push(S('<div class="lbl">C אחרי הצבירה</div>' + arrBox(Cc),
      "שורה 3: צבירה. עכשיו <code dir=\"ltr\">C[i]</code> = כמה איברים <b>קטנים או שווים</b> ל-i, כלומר <b>המיקום הסופי</b> של המופע האחרון של i ב-B.",
      "<code dir=\"ltr\">C[k] = n</code> תמיד.", 3, ops));
    var B = [null, null, null, null, null, null];
    for (var j = A.length - 1; j >= 0; j--) {
      var v = A[j];
      B[Cc[v - 1] - 1] = v;
      var pos = Cc[v - 1];
      Cc[v - 1]--; ops++;
      var hiB = {}; hiB[pos] = "hi";
      var hiC = {}; hiC[v] = "hi2";
      var hiA = {}; hiA[j + 1] = "hi";
      st.push(S('<div class="lbl">A · קוראים מ-j=' + (j + 1) + "</div>" + arrBox(A, { hi: hiA }) +
        '<div class="lbl">C</div>' + arrBox(Cc, { hi: hiC }) +
        '<div class="lbl">B (הפלט)</div>' + arrBox(B, { hi: hiB }),
        "<code dir=\"ltr\">A[" + (j + 1) + "]=" + v + "</code> ⟹ נכתב ל-<code dir=\"ltr\">B[" + pos + "]</code>, ואז <code dir=\"ltr\">C[" + v + "]</code> יורד ב-1.",
        j === A.length - 1 ? "" :
          "<b>כאן נולדת היציבות:</b> אנחנו קוראים מהסוף ומקטינים את C, ולכן מופע מוקדם יותר ב-A מקבל מיקום מוקדם יותר ב-B.", 5, ops));
    }
    st.push(S('<div class="lbl">B — ממוין</div>' + arrBox(B),
      "<b>ניתוח:</b> זמן <code dir=\"ltr\">Θ(n+k)</code>, מקום עזר <code dir=\"ltr\">Θ(n+k)</code>. " +
      "לינארי <u>רק אם</u> <code dir=\"ltr\">k = O(n)</code>. אם <code dir=\"ltr\">k = n²</code> זה כבר Θ(n²) — וזו המלכודת שחוזרת בכל מבחן.",
      "יציב, ולכן משמש כמיון המשני של מיון בסיס.", null, ops));
    return st;
  }
});

/* =====================================================================
   12. גיבוב — התנגשויות בשלוש שיטות
   ===================================================================== */
def({
  id: "hash", topic: "hash", title: "טבלת גיבוב — שרשור מול שלוש שיטות מיעון פתוח",
  sub: "אותם מפתחות, אותה <code dir=\"ltr\">h′(k) = k mod 11</code>, ארבע התנהגויות שונות לגמרי.",
  src: "מצגת 8 - טבלאות גיבוב, כולל הדוגמאות המלאות של שלוש שיטות הבדיקה",
  cnt: "מספר הבדיקות (probes) — כל גישה לתא נספרת",
  code: ["h'(k) = k mod 11",
         "לינארית:   h(k,i) = (h'(k) + i) mod 11",
         "ריבועית:   h(k,i) = (h'(k) + i^2) mod 11",
         "גיבוב כפול: h2(k) = 1 + (k mod 10) ; h(k,i) = (h'(k) + i*h2(k)) mod 11"],
  build: function () {
    var keys = [22, 11, 33, 5, 16], m = 11, st = [], probes = 0;
    function tbl(T, hi, lbl) {
      var cells = T.map(function (x) { return x == null ? null : x; });
      return '<div class="lbl">' + lbl + "</div>" + arrBox(cells, { hi: hi || {}, base: 0 });
    }
    st.push(S('<div class="card"><p>נכניס את המפתחות <code dir="ltr">22, 11, 33, 5, 16</code> לטבלה בגודל <code dir="ltr">m=11</code>.</p>' +
      '<p class="fml" dir="ltr">h\'(22)=0 · h\'(11)=0 · h\'(33)=0 · h\'(5)=5 · h\'(16)=5</p>' +
      "<p>שלושה מפתחות מתנגשים בתא 0 ושניים בתא 5 — <b>בכוונה</b>, כדי לראות את ההבדל בין השיטות.</p></div>",
      "התנגשות היא המצב הרגיל, לא חריג: לפי פרדוקס יום ההולדת די ב-√m מפתחות כדי לצפות להתנגשות.",
      "", 0, 0));

    /* שרשור */
    var chains = [[], [], [], [], [], [], [], [], [], [], []];
    keys.forEach(function (k) { chains[k % m].push(k); });
    st.push(S('<div class="lbl">שרשור — כל תא מצביע לרשימה מקושרת</div>' +
      chains.map(function (c, i) {
        return '<div style="display:flex;gap:8px;align-items:center;margin:2px 0;direction:ltr">' +
          '<span class="arrcell ' + (c.length ? "hi" : "dim") + '" style="min-width:34px;height:30px">' + i + "</span>" +
          (c.length ? '<span style="color:#5674bd">→</span> ' + c.map(function (k) {
            return '<span class="arrcell" style="min-width:38px;height:30px">' + k + "</span>";
          }).join(' <span style="color:#5674bd">→</span> ') : '<span style="color:#64748b">nil</span>') + "</div>";
      }).join(""),
      "<b>שרשור:</b> ההכנסה היא תמיד לראש הרשימה ⟹ <code dir=\"ltr\">O(1)</code> <b>גם במקרה הגרוע</b>. " +
      "החיפוש הוא <code dir=\"ltr\">Θ(1+α)</code> <b>בממוצע</b> (תחת הנחת הגיבוב האחיד הפשוט), ו-<code dir=\"ltr\">Θ(n)</code> במקרה הגרוע שבו כולם באותו תא.",
      "מקדם העומס כאן <code dir=\"ltr\">α = 5/11 ≈ 0.45</code>, ובשרשור מותר ש-α &gt; 1.", 0, 0));

    /* מיעון פתוח — שלוש שיטות */
    function openAddr(kind, codeLine) {
      var T = new Array(m).fill(null);
      var steps = [];
      var pr = 0;
      keys.forEach(function (k) {
        var i = 0, pos;
        while (true) {
          if (kind === "lin") pos = (k % m + i) % m;
          else if (kind === "quad") pos = (k % m + i * i) % m;
          else pos = (k % m + i * (1 + (k % 10))) % m;
          pr++;
          if (T[pos] == null) break;
          i++;
          if (i > 2 * m) break;
        }
        T[pos] = k;
        var hi = {}; hi[pos] = "hi";
        steps.push(S(tbl(T.slice(), hi, ({ lin: "בדיקה לינארית", quad: "בדיקה ריבועית", dbl: "גיבוב כפול" })[kind] + " · m=11"),
          "<b>הכנסת " + k + ":</b> <code dir=\"ltr\">h′(" + k + ")=" + (k % m) + "</code>. " +
          (i === 0 ? "התא היה פנוי — בדיקה אחת." :
            "התא היה תפוס; אחרי <b>" + i + "</b> ניסיונות נוספים נמצא התא <b>" + pos + "</b>."),
          i > 0 && kind === "lin" ? "כל התאים 0..i תפוסים ברצף — זו <b>הצבירה הראשונית</b> שהשיטה הלינארית סובלת ממנה." :
            kind === "quad" && i > 0 ? "הקפיצות הן <code dir=\"ltr\">+1, +4, +9</code> — פיזור טוב יותר, אבל שני מפתחות עם אותו h′ עדיין עוברים את אותו מסלול (<b>צבירה משנית</b>)." :
              kind === "dbl" && i > 0 ? "הקפיצה תלויה ב-k עצמו ⟹ שני מפתחות עם אותו h′ מקבלים מסלולים <b>שונים</b>." : "",
          codeLine, pr));
      });
      return steps;
    }
    st = st.concat(openAddr("lin", 1), openAddr("quad", 2), openAddr("dbl", 3));
    st.push(S('<div class="card"><div class="ttl">מה לזכור</div><ul>' +
      "<li><b>שרשור:</b> הכנסה O(1) גרוע · חיפוש Θ(1+α) ממוצע · α יכול לעלות על 1.</li>" +
      "<li><b>מיעון פתוח:</b> חייב <code dir=\"ltr\">α ≤ 1</code> · מחיקה דורשת סימון DELETED, אחרת שוברים שרשראות חיפוש.</li>" +
      "<li><b>לינארית</b> ⟵ צבירה ראשונית · <b>ריבועית</b> ⟵ צבירה משנית · <b>כפול</b> ⟵ הטוב מהשלושה, דורש <code dir=\"ltr\">h₂(k)</code> זר ל-m.</li>" +
      "<li><b>מה גיבוב לא יודע:</b> מינימום, עוקב, טווח, האיבר ה-k — כולם O(n). הגיבוב הורס את הסדר.</li></ul></div>",
      "<b>אף פעם אל תכתוב «גיבוב הוא O(1)» בלי לציין את סוג החסם ואת התנאי.</b> " +
      "הניסוח הנכון: «O(1) בממוצע תחת הנחת הגיבוב האחיד הפשוט; O(n) במקרה הגרוע».",
      "", null, null));
    return st;
  }
});

/* =====================================================================
   13. הרחבה — תחזוקת שדה size ברוטציה
   ===================================================================== */
def({
  id: "aug-size", topic: "aug", title: "שדה size — ומה קורה לו ברוטציה",
  sub: "כל שדה נוסף חייב להתעדכן ב<b>שלושה</b> מקומות: בהכנסה, במחיקה, וברוטציה. הסעיף השלישי הוא זה שנשכח — וזו בדיוק הנקודה שמורידה נקודות בשאלת התכנון.",
  src: "מצגת 9 - הרחבה של מבני נתונים (שדה size, Select, Rank)",
  code: ["size[x] = size[left[x]] + size[right[x]] + 1",
         "",
         "Select(x,i)   // האיבר ה-i בגודלו בתת-העץ של x",
         " 1  r <- size[left[x]] + 1",
         " 2  if i = r then return x",
         " 3  if i < r then return Select(left[x], i)",
         " 4  else return Select(right[x], i - r)"],
  build: function () {
    function N(k, l, r) { var n = { k: k, l: l, r: r }; n.f = "sz " + sz(n); return n; }
    function sz(n) { return n ? 1 + sz(n.l) + sz(n.r) : 0; }
    var st = [];
    var t1 = N(9, N(5, N(3, null, null), N(7, null, null)), N(12, null, null));
    st.push(S(treeSVG(t1, {}),
      "עץ עם שדה <code dir=\"ltr\">size</code> בכל צומת (מוצג כ-sz): מספר הצמתים בתת־העץ שלו, כולל עצמו.",
      "<code dir=\"ltr\">size[x] = size[left] + size[right] + 1</code> בכל צומת.", 0));
    st.push(S(treeSVG(t1, { hi: { 9: "hi", 5: "hi" } }),
      "<b>Select(root, 3)</b> — האיבר השלישי בגודלו. בשורש: <code dir=\"ltr\">r = size[left] + 1 = 3+1 = 4</code>. " +
      "מכיוון ש-<code dir=\"ltr\">3 < 4</code>, יורדים שמאלה עם אותו i.",
      "", 3));
    st.push(S(treeSVG(t1, { hi: { 5: "hi", 7: "ok" } }),
      "בצומת 5: <code dir=\"ltr\">r = size[left]+1 = 1+1 = 2</code>, ו-<code dir=\"ltr\">3 > 2</code> ⟹ יורדים ימינה עם <code dir=\"ltr\">i − r = 1</code>. " +
      "בצומת 7: <code dir=\"ltr\">r = 0+1 = 1 = i</code> ⟹ <b>התשובה היא 7</b>.<br>" +
      "בדיקה: In-Order הוא 3,5,7,9,12 — השלישי הוא אכן 7 ✓",
      "המסלול הוא O(h) ⟹ ב-AVL זה <code dir=\"ltr\">O(log n)</code>.", 4));
    var t2 = N(9, N(5, N(3, N(2, null, null), null), N(7, null, null)), N(12, null, null));
    st.push(S(treeSVG(t2, { hi: { 2: "new" } }),
      "<b>הכנסת 2:</b> השדה מתעדכן בכל צומת <u>במסלול</u> מהשורש לצומת החדש — 3, 5, 9. " +
      "עלות: O(1) לצומת × O(h) צמתים = <code dir=\"ltr\">O(h)</code>, כלומר <b>ההכנסה לא נעשתה יקרה יותר</b>.",
      "כל size בעץ מעודכן.", 0));
    st.push(S(treeSVG(t2, { hi: { 5: "bad" } }),
      "אבל עכשיו <code dir=\"ltr\">bf(5) = 2−0 = 2</code> ⟹ AVL מבצע <b>רוטציה ימנית</b> סביב 5. " +
      "<b>מה קורה ל-size?</b>",
      "", 0));
    var t3 = N(9, N(3, N(2, null, null), N(5, null, N(7, null, null))), N(12, null, null));
    /* בנייה מדויקת: רוטציה ימנית סביב 5 => 3 עולה, 5 יורד ימינה, בן ימני של 3 (אין) עובר לשמאל של 5 */
    t3 = N(9, N(3, N(2, null, null), N(5, null, N(7, null, null))), N(12, null, null));
    st.push(S(treeSVG(t3, { hi: { 3: "hi", 5: "hi" } }),
      "אחרי הרוטציה: 3 עלה, 5 ירד. <b>ה-size של שניהם השתנה</b> — 3 קיבל 4 ו-5 קיבל 2. " +
      "הכלל: אחרי רוטציה, מחשבים מחדש את size של <u>שני</u> הצמתים שהשתתפו, <b>מלמטה למעלה</b>, מהנוסחה. " +
      "כל שאר הצמתים בעץ לא הושפעו.",
      "<code dir=\"ltr\">size</code> נכון שוב בכל צומת, והתיקון עלה <code dir=\"ltr\">O(1)</code> לרוטציה.", 0));
    st.push(S(treeSVG(t3, {}) +
      '<div class="card"><div class="ttl">הכלל הכללי — מתי אפשר להרחיב</div>' +
      "<p>שדה ניתן לתחזוקה ב-O(1) לצומת אם ורק אם ניתן לחשב אותו <b>מהשדות של שני הבנים ומהמפתח של הצומת עצמו</b>. " +
      "<code dir=\"ltr\">size</code>, <code dir=\"ltr\">sum</code>, <code dir=\"ltr\">min</code>, <code dir=\"ltr\">max</code>, <code dir=\"ltr\">leaves</code> — כולם עומדים בתנאי. " +
      "«מספר האיברים הגדולים מהחציון» — <u>לא</u>, כי הוא תלוי בעץ כולו.</p>" +
      '<p class="fml" dir="ltr">O(1) לצומת × O(log n) צמתים במסלול + O(1) לרוטציה = O(log n)</p>' +
      "<p>וזה המשפט שצריך לכתוב בסוף כל תשובת תכנון.</p></div>",
      "<b>לסיכום:</b> הכנסה, מחיקה <u>ורוטציה</u>. אם בתשובה שלך לא כתוב מה קורה ברוטציה — חסרות לך נקודות.",
      "", 0));
    return st;
  }
});
})();
