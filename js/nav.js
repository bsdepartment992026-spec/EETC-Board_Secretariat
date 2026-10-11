/**
 * js/nav.js
 * شريط الأيقونات العلوي المشترك بين كل الشاشات، بترتيب خطوات العمل.
 * يُستدعى بـ renderTopNav('memos') مثلًا لتحديد الشاشة الحالية.
 */
const NAV_ITEMS = [
  { key: 'home', href: 'index.html', icon: '🏠', label: 'الشاشة الرئيسية', perm: null },
  { key: 'memos', href: 'memos.html', icon: '📄', label: 'المذكرات', perm: 'ManageMemos' },
  { key: 'pool', href: 'meetings.html', icon: '📑', label: 'إجمالي المذكرات', perm: 'ManageMeetings', action: 'latestRoll' },
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
      return `<a class="nav-icon ${isActive ? 'active' : ''}"
        href="${it.href}"${click}>
        <span>${it.icon}</span><small>${it.label}</small>
      </a>`;
    }).join('');
    // أيقونة تسجيل الخروج (رمز مثل باقي الأيقونات)
    html += `<a class="nav-icon" href="javascript:void(0)" onclick="API.logout()" title="تسجيل الخروج">
      <span>🚪</span><small>تسجيل الخروج</small>
    </a>`;

    document.querySelectorAll('.top-nav').forEach(function (el) { el.innerHTML = html; });
  } catch (e) {
    console.error('renderTopNav failed:', e);
  }
}

/* أنماط مشتركة لشريط التصفح — تُحقن مرة واحدة حتى لا تتكرر في كل صفحة */
(function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .topbar { background:#1B2A41; color:#fff; padding:10px 20px; display:flex;
              justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .topbar .brand { font-family:'Markazi Text', serif; font-size:16px; display:flex; align-items:center; gap:8px; }
    .top-nav { display:flex; gap:2px; flex-wrap:wrap; justify-content:flex-end; }
    .nav-icon { display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:4px;
                text-decoration:none; color:#C9CFD8; padding:8px 10px; border-radius:6px; font-size:12px;
                min-width:64px; }
    .nav-icon span { font-size:20px; line-height:1; height:24px; display:flex; align-items:center; }
    .nav-icon small { font-size:14px; line-height:1.2; white-space:nowrap; }
    .nav-icon:hover { background:rgba(255,255,255,.08); color:#fff; }
    .nav-icon.active { background:#A6802E; color:#fff; }

  `;
  document.head.appendChild(style);
})();
