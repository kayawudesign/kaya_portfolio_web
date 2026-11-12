(() => {
  const script = document.currentScript;
  const root = (script && script.dataset.root) || '';
  const projects = window.KAYA_PROJECTS || [];
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const here = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const t = (zh, ja) => `<span lang="zh-Hant">${zh}</span><span lang="ja">${ja}</span>`;
  const langSwitch = `<span class="lang-switch" role="group" aria-label="Language / 言語"><button type="button" data-lang="zh-Hant" title="繁體中文" aria-pressed="false">中</button><span aria-hidden="true">/</span><button type="button" data-lang="ja" title="日本語" aria-pressed="false">日</button></span>`;

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
  button.innerHTML = 'MENU <span class="menu-icon" aria-hidden="true"></span>';
  host.insertAdjacentHTML('beforeend', langSwitch);
  host.appendChild(button);

  /* ---- 作品分類（data.js の KAYA_MENU。粉彩協会は 1 項目にまとめ済み）---- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const groups = window.KAYA_MENU || [{ no: '', en: 'WORKS', zh: '', items: projects.map(p => ({
    slug: p.href.split('/').pop().replace('.html', ''), en: p.title, zh: p.local })) }];
  const itemCount = groups.reduce((n, g) => n + g.items.length, 0);

  let counter = 0;
  const groupsHtml = groups.map((group, groupIndex) => {
    const hasCurrent = group.items.some(it => `${it.slug}.html` === here);
    const panelId = `menuGroup${groupIndex}`;
    const links = group.items.map(it => {
      counter += 1;
      const current = `${it.slug}.html` === here;
      return `<a class="menu-project${current ? ' is-current' : ''}" href="${root}projects/${it.slug}.html"${current ? ' aria-current="page"' : ''}>
          <span class="menu-num">${String(counter).padStart(2, '0')}</span>
          <span class="menu-title">${it.en ? esc(it.en) : t(esc(it.zh), esc(it.ja || it.zh))}</span>
          ${it.en && it.zh ? `<span class="menu-local">${t(esc(it.zh), esc(it.ja || it.zh))}</span>` : ''}
        </a>`;
    }).join('');
    return `<section class="menu-group menu-reveal${hasCurrent ? ' is-expanded' : ''}" style="--i:${groupIndex}">
      <button class="menu-category" type="button" aria-expanded="${hasCurrent}" aria-controls="${panelId}">
        <span class="menu-category-no" aria-hidden="true">0${groupIndex + 1}</span>
        <span class="menu-category-title">${esc(group.en)}</span>
        <em class="menu-category-local">${t(esc(group.zh), esc(group.ja || group.zh))}</em>
        <span class="menu-icon" aria-hidden="true"></span>
      </button>
      <div class="menu-group-items" id="${panelId}"${hasCurrent ? '' : ' inert'}>
        <div class="menu-group-inner">${links}</div>
      </div>
    </section>`;
  }).join('');

  const menu = document.createElement('div');
  menu.className = 'site-menu';
  menu.id = 'siteMenu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', '選單');
  menu.dataset.labelZh = '選單';
  menu.dataset.labelJa = 'メニュー';
  menu.hidden = true;
  menu.innerHTML = `
    <div class="menu-bar">
      <a class="wordmark" href="${root}index.html">KAYA<span>®</span></a>
      <div class="topmeta">PORTFOLIO <span>2017—2026</span></div>
      <div class="menu-bar-actions topnav">${langSwitch}<button class="menu-close" type="button">CLOSE <span class="menu-icon" aria-hidden="true"></span></button></div>
    </div>
    <div class="menu-body">
      <nav class="menu-main" aria-label="網站選單" data-label-zh="網站選單" data-label-ja="サイトメニュー">
        ${groupsHtml}
      </nav>
      <aside class="menu-aside menu-reveal" style="--i:3">
        <div class="menu-aside-label">FOLLOW</div>
        <div class="menu-aside-brand">KAYA®</div>
        <p>GRAPHIC DESIGN<br>VISUAL COMMUNICATION<br>CREATIVE PLANNING</p>
        <div class="menu-aside-foot">© 2017—2026 KAYA.<br>ALL RIGHTS RESERVED.</div>
      </aside>
    </div>
    <svg class="menu-wave" viewBox="0 0 1600 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path id="menuWavePath" class="menu-wave-line" d="M-120 210 C 120 70, 380 70, 620 200 S 1120 330, 1380 200 S 1640 70, 1760 150"/>
      <text class="menu-wave-text"><textPath id="menuWaveText" href="#menuWavePath" xlink:href="#menuWavePath" startOffset="100%">GRAPHIC DESIGN <tspan class="sep">•</tspan> VISUAL COMMUNICATION <tspan class="sep">•</tspan> CREATIVE PLANNING <tspan class="sep">•</tspan> KAYA® PORTFOLIO 2017—2026 <tspan class="sep">•</tspan> GRAPHIC DESIGN <tspan class="sep">•</tspan> VISUAL COMMUNICATION <tspan class="sep">•</tspan> CREATIVE PLANNING <tspan class="sep">•</tspan> KAYA® PORTFOLIO 2017—2026 <tspan class="sep">•</tspan> GRAPHIC DESIGN <tspan class="sep">•</tspan> VISUAL COMMUNICATION <tspan class="sep">•</tspan> CREATIVE PLANNING <tspan class="sep">•</tspan> KAYA® PORTFOLIO 2017—2026 <tspan class="sep">•</tspan> GRAPHIC DESIGN <tspan class="sep">•</tspan> VISUAL COMMUNICATION <tspan class="sep">•</tspan> CREATIVE PLANNING <tspan class="sep">•</tspan> KAYA® PORTFOLIO 2017—2026 <tspan class="sep">•</tspan> </textPath></text>
    </svg>`;
  document.body.appendChild(menu);

  if (window.KAYA_LANG) window.KAYA_LANG.sync();


  /* ---- Text Along Path：メニューをスクロールすると、文字が曲線に沿って右 → 左へ流れる ---- */
  const waveText = menu.querySelector('#menuWaveText');
  const waveSvgMenuBody = menu.querySelector('.menu-body');
  let waveReady = false;
  let waveRefreshTimer = 0;
  const refreshWave = () => {
    clearTimeout(waveRefreshTimer);
    waveRefreshTimer = setTimeout(() => { if (window.ScrollTrigger && !menu.hidden) window.ScrollTrigger.refresh(); }, 420);
  };
  const initWave = () => {
    if (!waveText) return;
    if (reduceMotion) { waveText.setAttribute('startOffset', '12%'); return; }
    if (window.gsap && window.ScrollTrigger) {
      if (!waveReady) {
        waveReady = true;
        window.gsap.registerPlugin(window.ScrollTrigger);
        // textPath の startOffset を 100% → -100%。scrub なので、スクロール量 = 文字の動き、戻せば逆再生
        window.gsap.fromTo(waveText, { attr: { startOffset: '100%' } }, {
          attr: { startOffset: '-100%' }, ease: 'none',
          scrollTrigger: { scroller: menu, trigger: waveSvgMenuBody, start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true }
        });
      }
      window.ScrollTrigger.refresh();
    } else if (!waveReady) {
      // GSAP が読み込めなかったときの代替：scrollTop から直接計算
      waveReady = true;
      menu.addEventListener('scroll', () => {
        const max = Math.max(1, menu.scrollHeight - menu.clientHeight);
        waveText.setAttribute('startOffset', `${100 - 200 * (menu.scrollTop / max)}%`);
      }, { passive: true });
    }
  };
  document.addEventListener('kayalangchange', refreshWave);

  const closeButton = menu.querySelector('.menu-close');
  let lastFocus = null;

  /* ---- 分類の開閉（高さのアニメーションは CSS）---- */
  const setGroup = (category, willOpen) => {
    const group = category.closest('.menu-group');
    const panel = document.getElementById(category.getAttribute('aria-controls'));
    category.setAttribute('aria-expanded', String(willOpen));
    group.classList.toggle('is-expanded', willOpen);
    panel.inert = !willOpen;
    refreshWave();
  };
  menu.querySelectorAll('.menu-category').forEach(category => {
    const group = category.closest('.menu-group');
    category.addEventListener('mouseenter', () => {
      menu.querySelectorAll('.menu-category').forEach(other => {
        if (other !== category) setGroup(other, false);
      });
      setGroup(category, true);
    });
    group.addEventListener('mouseleave', () => {
      if (!group.contains(document.activeElement)) setGroup(category, false);
    });
    category.addEventListener('focus', () => setGroup(category, true));
    category.addEventListener('blur', event => {
      if (!group.contains(event.relatedTarget)) setGroup(category, false);
    });
    category.addEventListener('click', () => {
      const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      setGroup(category, hoverCapable ? true : category.getAttribute('aria-expanded') !== 'true');
    });
  });

  const open = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    menu.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(initWave));
    // 2 フレーム待ってから is-open を付けると、確実に transition が走る
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    document.documentElement.classList.add('menu-lock');
    button.setAttribute('aria-expanded', 'true');
    closeButton.focus({ preventScroll: true });
  };
  const close = (restoreFocus = true) => {
    menu.classList.remove('is-open');
    document.documentElement.classList.remove('menu-lock');
    button.setAttribute('aria-expanded', 'false');
    setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 360);
    if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
  };

  button.addEventListener('click', open);
  closeButton.addEventListener('click', () => close());
  menu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link) close(false);
  });
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'Tab') {
      const focusable = [...menu.querySelectorAll('a,button')].filter(el => !el.closest('[inert]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
