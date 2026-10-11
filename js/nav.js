/**
 * js/nav.js
 * شريط الأيقونات العلوي المشترك بين كل الشاشات، بترتيب خطوات العمل.
 * يُستدعى بـ renderTopNav('memos') مثلًا لتحديد الشاشة الحالية.
 */
const NAV_ITEMS = [
  { key: 'home', href: 'index.html', icon: '🏠', label: 'الشاشة الرئيسية', perm: null },
  { key: 'memos', href: 'memos.html', icon: '📄', label: 'المذكرات', perm: 'ManageMemos' },
  { key: 'pool', href: 'pool.html', icon: '📑', label: 'إجمالي المذكرات', perm: 'ManageMeetings' },
  { key: 'meetings', href: 'meetings.html', icon: '🗓️', label: 'الجلسات', perm: 'ManageMeetings' },
  { key: 'agenda', href: 'meetings.html', icon: '📋', label: 'جدول الأعمال', perm: 'ManageMeetings', action: 'latestRoll' },
  { key: 'decisions', href: 'decisions.html', icon: '✅', label: 'القرارات', perm: 'ManageDecisions' },
  { key: 'followups', href: 'followups.html', icon: '🔄', label: 'المتابعة', perm: 'ManageFollowUps' },
  { key: 'archive', href: 'archive.html', icon: '📁', label: 'الأرشيف', perm: 'ViewDashboardSearch' },
  { key: 'settings', href: 'settings.html', icon: '⚙️', label: 'الإعدادات', perm: ['ManageSettings', 'ManageUsers'] }
];

/* فتح رول آخر جلسة (لزرَّي "إجمالي المذكرات" و"جدول الأعمال"). */
function navOpenLatestRoll() {
  API.call('listMeetings').then(function (ms) {
    if (ms && ms.length) window.location.href = 'roll.html?id=' + encodeURIComponent(ms[0].MeetingID);
    else window.location.href = 'meetings.html';
  }).catch(function () { window.location.href = 'meetings.html'; });
}

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

    let html = NAV_ITEMS.filter(function (it) { return hasPerm(it.perm); }).map(function (it) {
      const isActive = it.key === activeKey;
      const click = it.action === 'latestRoll' ? ' onclick="navOpenLatestRoll();return false;"' : '';
      return `<a class="nav-icon ${isActive ? 'active' : ''}" href="${it.href}"${click}`
        + ` title="${it.label}" aria-label="${it.label}"><span>${it.icon}</span></a>`;
    }).join('');
    // أيقونة تسجيل الخروج (رمز مثل باقي الأيقونات)
    html += `<a class="nav-icon" href="javascript:void(0)" onclick="API.logout()"`
      + ` title="تسجيل الخروج" aria-label="تسجيل الخروج"><span>🚪</span></a>`;

    document.querySelectorAll('.top-nav').forEach(function (el) { el.innerHTML = html; });
  } catch (e) {
    console.error('renderTopNav failed:', e);
  }
}

/* أنماط مشتركة لشريط التصفح — تُحقن مرة واحدة حتى لا تتكرر في كل صفحة */
(function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .topbar { background:#1B2A41; color:#fff; padding:8px 14px; display:flex;
              justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .topbar .brand { font-family:'Markazi Text', serif; font-size:15px; display:flex; align-items:center; gap:6px; }
    .top-nav { display:flex; gap:2px; flex-wrap:wrap; justify-content:flex-start; }
    .nav-icon { display:flex; align-items:center; justify-content:center; width:38px; height:38px;
                text-decoration:none; color:#C9CFD8; border-radius:6px; font-size:19px; line-height:1;
                transition:background .15s, color .15s; }
    .nav-icon span { font-size:19px; line-height:1; }
    .nav-icon:hover { background:rgba(255,255,255,.14); color:#fff; }
    .nav-icon.active { background:#A6802E; color:#fff; }
    @media (max-width:520px) {
      .topbar { padding:6px 10px; gap:6px; }
      .topbar .brand { font-size:13px; }
      .nav-icon { width:34px; height:34px; font-size:17px; }
      .nav-icon span { font-size:17px; }
    }
  `;
  document.head.appendChild(style);
})();
