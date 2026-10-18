/**
 * js/nav.js
 * زر القائمة الرئيسية (أيقونة أسطر) ويفتح قائمة منسدلة موحّدة بين كل الشاشات.
 * يُستدعى بـ renderTopNav('memos') مثلًا لتحديد الشاشة الحالية.
 */
const NAV_ITEMS = [
  { key: 'home', href: 'index.html', label: 'الرئيسية', perm: null },
  { key: 'memos', href: 'memos.html', label: 'المذكرات', perm: 'ManageMemos' },
  { key: 'pool', href: 'pool.html', label: 'إجمالي المذكرات', perm: 'ManageMeetings' },
  { key: 'meetings', href: 'meetings.html', label: 'الجلسات', perm: 'ManageMeetings' },
  { key: 'agenda', href: 'meetings.html', label: 'جدول الأعمال', perm: 'ManageMeetings', action: 'latestRoll' },
  { key: 'decisions', href: 'decisions.html', label: 'القرارات', perm: 'ManageDecisions' },
  { key: 'distribution', label: 'التوزيع', soon: true },
  { key: 'followups', href: 'followups.html', label: 'المتابعة', perm: 'ManageFollowUps' },
  { key: 'minutes', label: 'محاضر الجلسات', soon: true },
  { key: 'archive', href: 'archive.html', label: 'الأرشيف', perm: 'ViewDashboardSearch' },
  { key: 'assembly', label: 'الجمعية العمومية', soon: true },
  { key: 'reports', label: 'التقارير', soon: true },
  { key: 'settings', href: 'settings.html', label: 'الإعدادات', perm: ['ManageSettings', 'ManageUsers'] }
];

/* فتح رول آخر جلسة (لزرّي "إجمالي المذكرات" و"جدول الأعمال"). */
function navOpenLatestRoll() {
  API.call('listMeetings').then(function (ms) {
    if (ms && ms.length) window.location.href = 'roll.html?id=' + encodeURIComponent(ms[0].MeetingID);
    else window.location.href = 'meetings.html';
  }).catch(function () { window.location.href = 'meetings.html'; });
}

function navEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function navToast(msg) {
  let t = document.getElementById('navToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'navToast';
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1B2A41;color:#fff;' +
      'padding:10px 20px;border-radius:5px;font-size:13px;z-index:80;box-shadow:0 8px 24px rgba(0,0,0,.25);';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._t);
  t._t = setTimeout(function () { t.style.display = 'none'; }, 2600);
}

function navComingSoon(name) {
  navToast('قسم «' + name + '» قيد الإنشاء وسيتم تفعيله قريبًا.');
  return false;
}

function toggleNavMenu(ev) {
  if (ev) { ev.stopPropagation(); }
  const m = document.getElementById('navMenu');
  if (m) m.classList.toggle('open');
}
function closeNavMenu() {
  const m = document.getElementById('navMenu');
  if (m) m.classList.remove('open');
}
document.addEventListener('click', function () { closeNavMenu(); });

function renderTopNav(activeKey) {
  try {
    const user = API.getUser();
    const perms = (user && Array.isArray(user.Permissions)) ? user.Permissions : [];
    const hasPerm = function (perm) {
      if (!perm) return true;
      if (!user) return false;
      if (Array.isArray(perm)) return perm.some(function (p) { return perms.indexOf(p) !== -1; });
      return perms.indexOf(perm) !== -1;
    };
    const name = user ? (user.FullName || user.Username || '') : '';

    let items = '<div class="nav-menu-name">' + navEsc(name) + '</div>';
    NAV_ITEMS.filter(function (it) { return hasPerm(it.perm); }).forEach(function (it) {
      const isActive = it.key === activeKey;
      const cls = 'nav-menu-item' + (isActive ? ' active' : '');
      if (it.soon) {
        items += '<a class="' + cls + '" href="javascript:void(0)" onclick="return navComingSoon(\'' + navEsc(it.label) + '\')">' + navEsc(it.label) + '</a>';
      } else if (it.action === 'latestRoll') {
        items += '<a class="' + cls + '" href="' + it.href + '" onclick="navOpenLatestRoll();return false;">' + navEsc(it.label) + '</a>';
      } else {
        items += '<a class="' + cls + '" href="' + it.href + '">' + navEsc(it.label) + '</a>';
      }
    });
    items += '<a class="nav-menu-item nav-menu-logout" href="javascript:void(0)" onclick="API.logout()">تسجيل الخروج</a>';

    const html =
      '<button type="button" class="nav-burger" onclick="toggleNavMenu(event)" title="القائمة الرئيسية" aria-label="القائمة الرئيسية">' +
        '<span class="b1"></span><span class="b2"></span><span class="b3"></span>' +
      '</button>' +
      '<div class="nav-menu" id="navMenu">' + items + '</div>';

    document.querySelectorAll('.top-nav').forEach(function (el) { el.innerHTML = html; });
  } catch (e) {
    console.error('renderTopNav failed:', e);
  }
}

/* أنماط مشتركة لشريط التصفح — تُحقن مرة واحدة حتى لا تتكرر في كل صفحة */
(function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .topbar { background:#1B2A41; color:#fff; padding:8px 16px; display:flex;
              justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .topbar .brand { font-family:'Markazi Text', serif; font-size:15px; display:flex; align-items:center; gap:6px; }
    .topbar .top-nav { order:-1; }
    .top-nav { position:relative; }
    .nav-burger { background:transparent; border:1px solid rgba(255,255,255,.28); border-radius:6px;
                  width:40px; height:36px; display:flex; flex-direction:column; justify-content:center;
                  align-items:center; gap:4px; cursor:pointer; padding:0; }
    .nav-burger:hover { background:rgba(255,255,255,.14); }
    .nav-burger span { display:block; width:20px; height:2px; background:#fff; border-radius:2px; }
    .nav-menu { position:absolute; top:44px; right:0; min-width:220px; background:#fff; color:#1B2A41;
                border:1px solid #E2E5EA; border-radius:8px; box-shadow:0 10px 28px rgba(27,42,65,.22);
                padding:6px; display:none; z-index:60; max-height:80vh; overflow:auto; }
    .nav-menu.open { display:block; }
    .nav-menu-name { font-size:12.5px; color:#1B2A41; padding:9px 12px; border-bottom:1px solid #E2E5EA;
                     margin-bottom:6px; font-weight:700; }
    .nav-menu-item { display:block; padding:9px 12px; font-size:13.5px; color:#1B2A41; text-decoration:none; border-radius:5px; }
    .nav-menu-item:hover { background:#F3F4F6; }
    .nav-menu-item.active { background:#F3ECDC; color:#8C6C25; font-weight:600; }
    .nav-menu-logout { color:#B3261E; border-top:1px solid #E2E5EA; margin-top:6px; }
    @media (max-width:520px) {
      .topbar { padding:6px 10px; gap:6px; }
      .topbar .brand { font-size:13px; }
      .nav-menu { min-width:190px; }
    }
  `;
  document.head.appendChild(style);
})();
