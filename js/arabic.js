/**
 * js/arabic.js
 * دوال عربية مشتركة لكل المطبوعات (الرول، جدول القرارات، المحضر).
 */
const AR = (function () {
  const BLANK = '............';
  const UNIT_F = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];
  const TEEN_F = { 11: 'الحادية عشرة', 12: 'الثانية عشرة', 13: 'الثالثة عشرة', 14: 'الرابعة عشرة', 15: 'الخامسة عشرة',
                   16: 'السادسة عشرة', 17: 'السابعة عشرة', 18: 'الثامنة عشرة', 19: 'التاسعة عشرة' };
  const UNIT_COMPOUND = ['', 'الحادية', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة'];
  const TENS = { 2: 'العشرون', 3: 'الثلاثون', 4: 'الأربعون', 5: 'الخمسون', 6: 'الستون', 7: 'السبعون', 8: 'الثمانون', 9: 'التسعون' };
  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  /** رقم الجلسة بالحروف (مؤنث). genitive=true للمجرور: "الثالثة والثلاثين" بدل "الثلاثون". */
  function ordinal(n, genitive) {
    n = Number(n);
    if (!n || n < 1) return BLANK;
    if (n <= 10) return UNIT_F[n];
    if (n <= 19) return TEEN_F[n];
    if (n < 100) {
      const t = Math.floor(n / 10), u = n % 10;
      let tens = TENS[t];
      if (genitive) tens = tens.replace(/ون$/, 'ين');
      return u === 0 ? tens : UNIT_COMPOUND[u] + ' و' + tens;
    }
    return String(n);
  }

  function parts(dateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }
  function formatDate(dateStr) {
    const p = parts(dateStr);
    return p ? p.d + '/' + p.m + '/' + p.y : BLANK;
  }
  function year(dateStr) {
    const p = parts(dateStr);
    return p ? String(p.y) : BLANK;
  }
  function dayName(dateStr) {
    const p = parts(dateStr);
    return p ? DAYS[new Date(p.y, p.m - 1, p.d).getDay()] : BLANK;
  }

  function hourWord(h) {
    const x = ((h + 11) % 12) + 1;
    return x <= 10 ? UNIT_F[x] : TEEN_F[x];
  }
  /** "10:30" -> "العاشرة والنصف" */
  function timeWords(t) {
    const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
    if (!m) return BLANK;
    const hh = +m[1], mm = +m[2];
    if (mm === 0) return hourWord(hh);
    if (mm === 15) return hourWord(hh) + ' والربع';
    if (mm === 30) return hourWord(hh) + ' والنصف';
    if (mm === 45) return hourWord(hh + 1) + ' إلا ربعاً';
    if (mm === 5) return hourWord(hh) + ' وخمس دقائق';
    if (mm === 10) return hourWord(hh) + ' وعشر دقائق';
    return hourWord(hh) + ' و' + mm + ' دقيقة';
  }

  /** يركّب موضوع البند الثابت من القالب المخزّن في Settings + بيانات الجلسة المرجعية. */
  function composeSpecial(template, ref) {
    const hasRef = ref && ref.SessionDate;
    return (template || '')
      .replace(/\{refSession\}/g, ref && ref.SessionNumber ? ordinal(ref.SessionNumber, true) : BLANK)
      .replace(/\{refYear\}/g, hasRef ? year(ref.SessionDate) : BLANK)
      .replace(/\{refDate\}/g, hasRef ? formatDate(ref.SessionDate) : BLANK);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * يحوّل الأرقام اللاتينية إلى هندية/عربية (٠-٩).
   * أي «كلمة» تحتوي حروفًا إنجليزية تُترك كما هي (الأرقام مع النصوص الإنجليزية فقط).
   */
  function digits(v) {
    return String(v == null ? '' : v).replace(/\S+/g, function (tok) {
      if (/[A-Za-z]/.test(tok)) return tok;
      return tok.replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; });
    });
  }

  /** يحوّل الأرقام داخل كل النصوص الظاهرة في عنصر (يتجاهل الحقول القابلة للكتابة). */
  function arabize(root) {
    if (!root || typeof document === 'undefined') return;
    const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };
    (function rec(node) {
      if (node.nodeType === 3) {
        const nv = node.nodeValue;
        if (/[0-9]/.test(nv)) { const nv2 = digits(nv); if (nv2 !== nv) node.nodeValue = nv2; }
        return;
      }
      if (node.nodeType !== 1) return;
      if (SKIP[node.tagName]) return;
      if (node.hasAttribute && (node.hasAttribute('data-latin') || (node.classList && node.classList.contains('no-ar')))) return;
      for (let i = 0; i < node.childNodes.length; i++) rec(node.childNodes[i]);
    })(root);
  }

  /** يفعّل التحويل التلقائي للعناصر المُضافة لاحقًا (childList فقط، مُجمّعة كل إطار). */
  function watch() {
    if (typeof document === 'undefined' || window.__arDigitsWatch) return;
    window.__arDigitsWatch = true;
    const queue = [];
    let scheduled = false;
    function flush() {
      scheduled = false;
      const nodes = queue.splice(0, queue.length);
      for (let i = 0; i < nodes.length; i++) {
        try { arabize(nodes[i]); } catch (e) { /* تجاهل */ }
      }
    }
    try {
      const obs = new MutationObserver(function (muts) {
        for (let i = 0; i < muts.length; i++) {
          const added = muts[i].addedNodes;
          for (let j = 0; j < added.length; j++) queue.push(added[j]);
        }
        if (!scheduled && queue.length) {
          scheduled = true;
          if (window.requestAnimationFrame) window.requestAnimationFrame(flush);
          else setTimeout(flush, 16);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* تجاهل */ }
    arabize(document.body);
  }
  if (typeof document !== 'undefined') {
    if (document.body) watch();
    else document.addEventListener('DOMContentLoaded', watch);
  }

  return { BLANK, ordinal, formatDate, year, dayName, timeWords, composeSpecial, esc, digits, arabize, watch };
})();
