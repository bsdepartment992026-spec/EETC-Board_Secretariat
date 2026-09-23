/**
 * js/api.js
 * ملف مشترك لكل الشاشات. مسؤوليته الوحيدة: التواصل مع Google Apps Script.
 * يحفظ رابط الـ Web App في هذا المتصفح فقط (localStorage) حتى لا تكتبه كل مرة.
 */

const API = {
  getUrl() {
    return localStorage.getItem('apiUrl') || '';
  },
  setUrl(url) {
    localStorage.setItem('apiUrl', url.trim());
  },
  async call(action, payload) {
    const url = this.getUrl();
    if (!url) throw new Error('لم يتم ضبط رابط الاتصال بعد. افتح صفحة الإعدادات وأدخله.');

    // نرسل كـ text/plain عمدًا: يتجاوز مشكلة CORS مع Apps Script بدون أي إعداد إضافي
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload: payload || {} })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'حدث خطأ غير معروف من الخادم.');
    return json.data;
  }
};
