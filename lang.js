/* 言語切替（繁體中文 / 日本語）。<head> で同期読み込みして、表示前に <html lang> を決める。
   中文・日本語の両方を HTML に書き、CSS で今の言語だけ表示する（style.css の "language switch"）。 */
(() => {
  const KEY = 'kaya-lang';
  const SUPPORTED = ['zh-Hant', 'ja'];
  const root = document.documentElement;

  const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const initial = () => {
    const saved = stored();
    if (SUPPORTED.includes(saved)) return saved;
    return /^ja/i.test(navigator.language || '') ? 'ja' : 'zh-Hant';
  };

  const apply = lang => {
    root.lang = lang;
    // aria-label / alt / meta content など、属性の言語切替
    document.querySelectorAll('[data-label-zh]').forEach(el => {
      const value = lang === 'ja' ? el.dataset.labelJa : el.dataset.labelZh;
      if (value) el.setAttribute(el.dataset.labelAttr || 'aria-label', value);
    });
    document.querySelectorAll('[data-lang]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });
  };

  const set = lang => {
    if (!SUPPORTED.includes(lang)) return;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* noop */ }
    apply(lang);
    document.dispatchEvent(new CustomEvent('kayalangchange', { detail: { lang } }));
  };

  root.lang = initial();
  window.KAYA_LANG = { get: () => root.lang, set, sync: () => apply(root.lang) };
  document.addEventListener('click', event => {
    const button = event.target.closest && event.target.closest('[data-lang]');
    if (button) set(button.dataset.lang);
  });
  document.addEventListener('DOMContentLoaded', () => apply(root.lang));
})();
