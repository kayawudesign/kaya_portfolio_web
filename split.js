(() => {
  const root = document.querySelector('.split');
  if (!root) return;

  const counterNow = root.querySelector('.split-counter-now');
  const counterTotal = root.querySelector('.split-counter-total');
  const counterLabel = root.querySelector('.split-counter-label');
  const pad = n => String(n).padStart(2, '0');
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);


  /* ---- strip モード：画像は 1 本の長い帯としてスクロール、右の文章は固定。
          副題（.swap-sub）と本文（.swap-body）は、それぞれ自分の「状態」が変わったときだけ入れ替える ---- */
  if (root.classList.contains('split--strip')) {
    // 画像ごとに data-sub / data-body（無ければ data-state）で、どの副題・本文を出すかを指定する
    let figs = [...root.querySelectorAll('.strip-img')].map(fig => ({
      fig,
      sub: fig.dataset.sub !== undefined ? fig.dataset.sub : fig.dataset.state,
      body: fig.dataset.body !== undefined ? fig.dataset.body : fig.dataset.state,
      trigger: null
    }));
    const subItems = [...root.querySelectorAll('.swap-sub .swap-item')];
    const bodyItems = [...root.querySelectorAll('.swap-body .swap-item')];
    const scroller = root.querySelector('.swap-body');
    const label = root.querySelector('.split-counter-label');
    const now = root.querySelector('.split-counter-now');
    const total = root.querySelector('.split-counter-total');
    const pad2 = n => String(n).padStart(2, '0');
    let active = null;
    let io = null;

    const mobileCards = document.createElement('div');
    mobileCards.className = 'project-card-stack';
    const fixedPanel = root.querySelector('.chapter.fixed-panel');
    const title = fixedPanel && fixedPanel.querySelector('.chapter-title');
    const name = fixedPanel && fixedPanel.querySelector('.chapter-name');
    const subtitleItems = [...root.querySelectorAll('.swap-sub .swap-item')];
    const descriptionItems = [...root.querySelectorAll('.swap-body .swap-item')];
    const cloneStateContent = (items, key, selector) => {
      const item = items.find(el => el.dataset.state === String(key));
      if (!item) return null;
      const sources = selector ? [item.querySelector(selector)].filter(Boolean) : [...item.children];
      if (!sources.length) return null;
      const content = selector ? sources[0].cloneNode(true) : document.createElement('div');
      if (!selector) sources.forEach(source => content.appendChild(source.cloneNode(true)));
      const clean = node => {
        node.classList.remove('swap-line');
        node.removeAttribute('style');
        node.querySelectorAll('.swap-line').forEach(line => {
          line.classList.remove('swap-line');
          line.removeAttribute('style');
        });
      };
      clean(content);
      return content;
    };
    figs.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'project-stack-card';
      card.style.setProperty('--stack-index', index);
      card.style.setProperty('--stack-top', `${72 + index * 14}px`);

      const image = item.fig.querySelector('img');
      if (image) {
        const visual = document.createElement('figure');
        visual.className = 'project-stack-visual';
        const imageClone = image.cloneNode(true);
        imageClone.loading = 'lazy';
        visual.appendChild(imageClone);
        const number = document.createElement('span');
        number.className = 'project-stack-number';
        number.textContent = `${pad2(index + 1)} / ${pad2(figs.length)}`;
        visual.appendChild(number);
        card.appendChild(visual);
      }

      const copy = document.createElement('div');
      copy.className = 'project-stack-copy';
      if (index === 0) {
        if (title) {
          const h2 = document.createElement('h2');
          h2.className = 'project-stack-title';
          h2.innerHTML = title.innerHTML;
          copy.appendChild(h2);
        }
        if (name) {
          const localName = name.cloneNode(true);
          localName.className = 'project-stack-name';
          copy.appendChild(localName);
        }
      }
      const subKey = item.fig.dataset.sub !== undefined ? item.fig.dataset.sub : item.fig.dataset.state;
      const bodyKey = item.fig.dataset.body !== undefined ? item.fig.dataset.body : item.fig.dataset.state;
      const subtitle = cloneStateContent(subtitleItems, subKey, '.chapter-sub');
      if (subtitle) {
        subtitle.classList.add('project-stack-subtitle');
        copy.appendChild(subtitle);
      }
      const description = cloneStateContent(descriptionItems, bodyKey);
      if (description) {
        const body = document.createElement('div');
        body.className = 'project-stack-description';
        body.appendChild(description);
        copy.appendChild(body);
      }
      card.appendChild(copy);
      mobileCards.appendChild(card);
    });
    root.appendChild(mobileCards);

    if (hasGsap && window.gsap.matchMedia) {
      const stackMedia = window.gsap.matchMedia();
      stackMedia.add('(max-width: 800px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = [...mobileCards.querySelectorAll('.project-stack-card')];
        cards.forEach((card, index) => {
          const nextCard = cards[index + 1];
          if (!nextCard) return;
          const nextTop = 72 + (index + 1) * 14;
          window.gsap.to(card, {
            scale: 0.94,
            rotateX: 9,
            transformOrigin: 'bottom center',
            ease: 'none',
            scrollTrigger: {
              trigger: nextCard,
              start: 'top bottom',
              end: () => `top ${nextTop}px`,
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        });
      });
    }

    const counter = () => {
      const index = Math.max(0, figs.indexOf(active));
      if (now) now.textContent = pad2(index + 1);
      if (total) total.textContent = pad2(figs.length);
      if (label && active) label.innerHTML = active.fig.dataset.label || '';
    };
    // 長い本文は文章エリアの中でスクロールできる。下にまだ続くときは、下端をふわっと薄くして知らせる
    const hint = () => {
      if (!scroller) return;
      const over = scroller.scrollHeight > scroller.clientHeight + 2;
      const more = over && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2;
      scroller.classList.toggle('has-more', more);
      if (over) scroller.setAttribute('tabindex', '0'); else scroller.removeAttribute('tabindex');
    };
    const hintSoon = () => { hint(); setTimeout(hint, 120); setTimeout(hint, 480); };
    if (scroller) {
      scroller.addEventListener('scroll', hint, { passive: true });
      window.addEventListener('resize', hint);
      document.addEventListener('kayalangchange', hintSoon);
    }
    // When the pointer is outside the text panel, send wheel input there first.
    root.addEventListener("wheel", event => {
      if (event.ctrlKey || !event.deltaY) return;
      const mobile = window.matchMedia("(max-width:800px)").matches;
      const panelScroller = mobile ? root.querySelector(".chapter.fixed-panel") : scroller;
      if (!panelScroller || panelScroller.contains(event.target)) return;
      const max = Math.max(0, panelScroller.scrollHeight - panelScroller.clientHeight);
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? Math.max(panelScroller.clientHeight, 1) : 1);
      const top = panelScroller.scrollTop;
      const canScrollText = delta > 0 ? top < max - 1 : top > 1;
      if (!canScrollText) return; // let the existing continuous image strip advance at the text edge
      event.preventDefault();
      panelScroller.scrollTop = Math.max(0, Math.min(max, top + delta));
      if (!mobile) hint();
    }, { passive: false, capture: true });
    // 古い方が先に上へ消え（is-leaving）、そのあと新しい方が下から浮かぶ
    const swapTo = (items, key) => {
      items.forEach(s => {
        const on = s.dataset.state === key;
        if (s.classList.contains('is-active') && !on) {
          s.classList.add('is-leaving');
          clearTimeout(s._leave);
          s._leave = setTimeout(() => s.classList.remove('is-leaving'), 360);
        }
        if (on) s.classList.remove('is-leaving');
        s.classList.toggle('is-active', on);
      });
    };
    const show = item => {
      if (!item || item === active) return;
      const prev = active;
      active = item;
      figs.forEach(f => f.fig.classList.toggle('is-active', f === item));
      if (!prev || prev.sub !== item.sub) swapTo(subItems, item.sub);   // 副題が同じなら動かさない
      if (!prev || prev.body !== item.body) {
        swapTo(bodyItems, item.body);
        if (scroller) scroller.scrollTop = 0;
        const mobilePanel = root.querySelector(".chapter.fixed-panel");
        if (mobilePanel) mobilePanel.scrollTop = 0;
        hintSoon();
      }
      counter();
    };
    const bindStrip = item => {
      if (hasGsap) {
        item.trigger = window.ScrollTrigger.create({
          trigger: item.fig, start: 'top 65%', end: 'bottom 65%',
          onToggle: self => { if (self.isActive) show(item); }
        });
      } else if (io) {
        io.observe(item.fig);
      }
    };
    const dropStrip = item => {
      if (!figs.includes(item)) return;
      if (item.trigger) item.trigger.kill();
      if (io) io.unobserve(item.fig);
      figs = figs.filter(f => f !== item);
      item.fig.remove();
      if (!figs.some(f => f.sub === item.sub)) subItems.filter(s => s.dataset.state === item.sub).forEach(s => s.remove());
      if (!figs.some(f => f.body === item.body)) bodyItems.filter(s => s.dataset.state === item.body).forEach(s => s.remove());
      if (active === item) { active = null; show(figs[0]); }
      counter();
      if (hasGsap) window.ScrollTrigger.refresh();
    };
    const watchStrip = item => {
      const img = item.fig.querySelector('img');
      if (!img) return;
      const fail = () => {
        const fallback = img.dataset.fallback;
        if (fallback && img.getAttribute('src') !== fallback) {
          img.addEventListener('error', () => dropStrip(item), { once: true });
          img.src = fallback;
          return;
        }
        dropStrip(item);
      };
      if (img.complete && img.naturalWidth === 0) { fail(); return; }
      img.addEventListener('error', fail, { once: true });
    };

    if (!hasGsap && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) show(figs.find(f => f.fig === entry.target)); });
      }, { rootMargin: '-60% 0px -30% 0px' });
    }
    root.classList.add('is-ready');
    figs.slice().forEach(item => { bindStrip(item); watchStrip(item); });
    show(figs[0]);
    hintSoon();
    if (hasGsap) {
      window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
      root.querySelectorAll(".strip-img img").forEach(img => img.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true }));
    }
    return;
  }

  let chapters = [...root.querySelectorAll('.chapter')].map(el => ({
    el,
    fig: root.querySelector(`.split-img[data-index="${el.dataset.index}"]`),
    trigger: null
  })).filter(item => item.fig);
  let current = null;
  let observer = null;

  const updateCounter = () => {
    const index = Math.max(0, chapters.indexOf(current));
    if (counterNow) counterNow.textContent = pad(index + 1);
    if (counterTotal) counterTotal.textContent = pad(chapters.length);
    if (counterLabel && current) counterLabel.textContent = current.el.dataset.label || '';
  };

  const renumber = () => {
    chapters.forEach((item, i) => {
      const num = item.el.querySelector('.chapter-num b');
      const total = item.el.querySelector('.chapter-num .chapter-total');
      if (num) num.textContent = pad(i + 1);
      if (total) total.textContent = pad(chapters.length);
    });
  };

  // 章の切り替え：左の画像を交差フェード + 拡大 → 原寸に戻す（CSS の transition）
  const activate = item => {
    if (!item || item === current) return;
    current = item;
    chapters.forEach(c => {
      const on = c === item;
      c.el.classList.toggle('is-active', on);
      c.fig.classList.toggle('is-active', on);
      c.fig.setAttribute('aria-hidden', String(!on));
    });
    updateCounter();
  };

  const bind = item => {
    if (hasGsap) {
      item.trigger = window.ScrollTrigger.create({
        trigger: item.el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: self => { if (self.isActive) activate(item); }
      });
    } else if (observer) {
      observer.observe(item.el);
    }
  };

  // 画像ファイルが見つからない章は自動的に省く（後からファイルを追加すれば自動で復活）
  const prune = item => {
    if (!chapters.includes(item)) return;
    if (item.trigger) item.trigger.kill();
    if (observer) observer.unobserve(item.el);
    chapters = chapters.filter(c => c !== item);
    item.el.remove();
    item.fig.remove();
    if (current === item) { current = null; activate(chapters[0]); }
    renumber();
    updateCounter();
    if (hasGsap) window.ScrollTrigger.refresh();
  };

  const watch = item => {
    const img = item.fig.querySelector('img');
    if (!img) return;
    const fail = () => {
      const fallback = img.dataset.fallback;
      // 本物の画像がまだ無いときは、代わりの画像に差し替える（章は消さない）
      if (fallback && img.getAttribute('src') !== fallback) {
        img.addEventListener('error', () => prune(item), { once: true });
        img.src = fallback;
        return;
      }
      prune(item);
    };
    if (img.complete && img.naturalWidth === 0) { fail(); return; }
    img.addEventListener('error', fail, { once: true });
  };

  if (!hasGsap && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activate(chapters.find(c => c.el === entry.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
  }

  root.classList.add('is-ready');
  chapters.slice().forEach(item => { bind(item); watch(item); });
  renumber();
  activate(chapters[0]);
  if (hasGsap) window.addEventListener('load', () => window.ScrollTrigger.refresh(), { once: true });
})();
