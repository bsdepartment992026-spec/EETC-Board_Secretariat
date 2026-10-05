/**
 * js/nav.js
 * شريط الأيقونات العلوي المشترك بين كل الشاشات، بترتيب خطوات العمل.
 * يُستدعى بـ renderTopNav('memos') مثلًا لتحديد الشاشة الحالية.
 */
const NAV_ITEMS = [
  { key: 'home', href: 'index.html', icon: '🏠', label: 'الرئيسية', perm: null },
  { key: 'memos', href: 'memos.html', icon: '📄', label: 'المذكرات', perm: 'ManageMemos' },
  { key: 'meetings', href: 'meetings.html', icon: '📋', label: 'الجلسات والرول', perm: 'ManageMeetings' },
  { key: 'decisions', href: '#', icon: '✅', label: 'القرارات', perm: 'ManageDecisions' },
  { key: 'followups', href: '#', icon: '🔄', label: 'المتابعة', perm: 'ManageFollowUps' },
  { key: 'archive', href: '#', icon: '📁', label: 'الأرشيف', perm: 'ViewDashboardSearch' },
  { key: 'settings', href: 'settings.html', icon: '⚙️', label: 'الإعدادات', perm: ['ManageSettings', 'ManageUsers'] }
];

function renderTopNav(activeKey) {
  const user = API.getUser();
  const hasPerm = function (perm) {
    if (!perm) return true;
    if (!user) return false;
    if (Array.isArray(perm)) return perm.some(function (p) { return user.Permissions.includes(p); });
    return user.Permissions.includes(perm);
  };

  const html = NAV_ITEMS.filter(function (it) { return hasPerm(it.perm); }).map(function (it) {
    const isActive = it.key === activeKey;
    const disabled = it.href === '#';
    return `<a class="nav-icon ${isActive ? 'active' : ''} ${disabled ? 'soon' : ''}"
      ${disabled ? 'onclick="return false;" title="قريبًا"' : `href="${it.href}"`}>
      <span>${it.icon}</span><small>${it.label}</small>
    </a>`;
  }).join('');

  document.querySelectorAll('.top-nav').forEach(function (el) { el.innerHTML = html; });
}

/* أنماط مشتركة لشريط التصفح — تُحقن مرة واحدة حتى لا تتكرر في كل صفحة */
(function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .topbar { background:#1B2A41; color:#fff; padding:10px 20px; display:flex;
              justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .topbar .brand { font-family:'Markazi Text', serif; font-size:16px; display:flex; align-items:center; gap:8px; }
    .top-nav { display:flex; gap:2px; }
    .nav-icon { display:flex; flex-direction:column; align-items:center; gap:2px; text-decoration:none;
                color:#C9CFD8; padding:6px 10px; border-radius:6px; font-size:10px; min-width:52px; }
    .nav-icon span { font-size:16px; }
    .nav-icon:hover { background:rgba(255,255,255,.08); color:#fff; }
    .nav-icon.active { background:#A6802E; color:#fff; }
    .nav-icon.soon { opacity:.4; cursor:default; }
    .nav-icon.soon:hover { background:none; color:#C9CFD8; }
  `;
  document.head.appendChild(style);
})();
