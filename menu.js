(() => {
  const script = document.currentScript;
  const root = (script && script.dataset.root) || '';
  const projects = window.KAYA_PROJECTS || [];
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const here = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const isHome = here === '' || here === 'index.html';

  /* ---- ボタン（右上）---- */
  let host = topbar.querySelector('.topnav');
  if (!host) {
    host = document.createElement('div');
    host.className = 'topnav';
    const existing = topbar.querySelector(':scope > .navlink');
    if (existing) host.appendChild(existing);
    topbar.appendChild(host);
  }
  const button = document.createElement('button');
  button.className = 'menu-button';
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'siteMenu');
  button.innerHTML = 'MENU <b aria-hidden="true">＋</b>';
  host.appendChild(button);

  /* ---- メニュー本体 ---- */
  const items = projects.map((p, i) => {
    const current = p.href.split('/').pop() === here;
    return `<a class="menu-project${current ? ' is-current' : ''}" href="${root}${p.href}"${current ? ' aria-current="page"' : ''}>
      <span class="menu-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="menu-title">${p.title}</span>
      <span class="menu-local">${p.local}</span>
    </a>`;
  }).join('');

  const menu = document.createElement('div');
  menu.className = 'site-menu';
  menu.id = 'siteMenu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'メニュー');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="menu-bar">
      <a class="wordmark" href="${root}index.html">KAYA<span>®</span></a>
      <button class="menu-close" type="button">CLOSE <b aria-hidden="true">×</b></button>
    </div>
    <div class="menu-body">
      <nav class="menu-main" aria-label="サイトメニュー">
        <a class="menu-link${isHome ? ' is-current' : ''}" href="${root}index.html">HOME <span>トップ</span></a>
        <a class="menu-link" href="${root}index.html#featured">WORKS <span>作品一覧</span></a>
        <a class="menu-link" href="${root}index.html#profile">PROFILE <span>プロフィール</span></a>
        <p class="menu-note">GRAPHIC DESIGN<br>VISUAL COMMUNICATION<br>CREATIVE PLANNING</p>
      </nav>
      <nav class="menu-projects" aria-label="作品">
        <div class="menu-label">SELECTED WORKS / ${String(projects.length).padStart(2, '0')}</div>
        ${items}
      </nav>
    </div>`;
  document.body.appendChild(menu);

  const closeButton = menu.querySelector('.menu-close');
  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    document.documentElement.classList.add('menu-lock');
    button.setAttribute('aria-expanded', 'true');
    closeButton.focus({ preventScroll: true });
  };
  const close = (restoreFocus = true) => {
    menu.classList.remove('is-open');
    document.documentElement.classList.remove('menu-lock');
    button.setAttribute('aria-expanded', 'false');
    setTimeout(() => { menu.hidden = true; }, 260);
    if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
  };

  button.addEventListener('click', open);
  closeButton.addEventListener('click', () => close());
  // リンクを押したら閉じる（同じページ内の #featured / #profile でも閉じる）
  menu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link) close(false);
  });
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'Tab') {
      const focusable = [...menu.querySelectorAll('a,button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
