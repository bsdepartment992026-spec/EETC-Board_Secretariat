/**
 * js/api.js
 * ملف مشترك لكل الشاشات. رابط الاتصال بالخادم ثابت هنا في الكود —
 * لا حاجة لأي إعداد من المستخدم.
 */

const CONFIG = {
  // ضع هنا رابط Web App من Apps Script (Deploy > Manage deployments)
  API_URL: 'https://script.google.com/macros/s/AKfycbziLBxVvDLCjMEwMtXwwY6Sru0YNrm5_AbKbNNMJIhdjML1lwXJVk-5MquFqudJtEa0/exec'
};

const API = {
  getToken() { return localStorage.getItem('authToken') || ''; },
  getUser() {
    try { return JSON.parse(localStorage.getItem('authUser') || 'null'); }
    catch (e) { return null; }
  },
  setSession(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  hasPermission(key) {
    const u = this.getUser();
    return !!(u && u.Permissions && u.Permissions.includes(key));
  },

  async call(action, payload) {
    const body = Object.assign({}, payload || {}, { token: this.getToken() });
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload: body })
    });
    const json = await res.json();

    if (!json.ok) {
      if (/تسجيل الدخول|جلسة/.test(json.error) && action !== 'login') {
        this.clearSession();
        window.location.href = 'login.html';
      }
      throw new Error(json.error || 'حدث خطأ غير متوقع.');
    }
    return json.data;
  },

  requireLogin() {
    if (!this.getToken()) window.location.href = 'login.html';
  },

  async logout() {
    try { await this.call('logout'); } catch (e) { /* تجاهل */ }
    this.clearSession();
    window.location.href = 'login.html';
  }
};
