(() => {
  const projects = window.KAYA_PROJECTS || [];
  const viewport = document.getElementById('galleryTrack');
  if (!viewport) return;

  const carousel = viewport.closest('.works-carousel') || viewport;
  const prevButton = document.querySelector('.works-carousel-prev');
  const nextButton = document.querySelector('.works-carousel-next');
  const toggleButton = document.querySelector('.works-carousel-toggle');
  const countLabel = document.querySelector('.works-carousel-count');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 55;            // 跑馬燈の速度 (px / 秒)。ここを変えると速さが変わります
  const RESUME_DELAY = 700;    // ホバー解除後、再び動き出すまでの待ち時間 (ms)
  const TOUCH_HOLD = 4500;     // タッチ操作のあと、再び動き出すまでの待ち時間 (ms)
  const total = projects.length;

  let itemW = 0;               // 1 枚あたりの幅 (px)
  let loopW = 0;               // 1 セット分の幅 (px)
  let x = 0;                   // 現在のスクロール位置 (px)
  let track;
  let speedNow = 0;
  let nudgeLeft = 0;           // ボタン / キーによる移動の残り距離
  let lastTime = 0;
  let running = false;
  let rafId = 0;
  let settleUntil = 0;         // 展開 / 収納アニメーションが終わる時刻
  let shownIndex = -1;

  let autoplayOn = !reduceMotion;
  let hoverPause = false;
  let focusPause = false;
  let dragging = false;
  let touchHoldUntil = 0;
  let inView = false;

  let pointerId = null;
  let pointerStartX = 0;
  let pointerLastX = 0;
  let suppressClick = false;

  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
  const wrapIndex = index => ((index % total) + total) % total;

  /* ---------- パネル ---------- */
  const activate = panel => {
    if (dragging || !panel || panel.inert) return;
    track.querySelectorAll('.expanding-panel.is-active').forEach(item => {
      if (item !== panel) { item.classList.remove('is-active'); item.setAttribute('aria-current', 'false'); }
    });
    panel.classList.add('is-active');
    panel.setAttribute('aria-current', 'true');
    settleUntil = performance.now() + 700;
  };

  const clearActive = () => {
    const had = track.querySelector('.expanding-panel.is-active');
    track.querySelectorAll('.expanding-panel.is-active').forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-current', 'false');
    });
    if (had) settleUntil = performance.now() + 700;
  };

  const makePanel = (project, index, isClone) => {
    const panel = document.createElement('article');
    panel.className = 'expanding-panel';
    panel.innerHTML = `
      <a class="expanding-panel-link" href="${project.href}" aria-label="${project.title} — プロジェクト詳細" tabindex="${isClone ? '-1' : '0'}">
        <img src="${project.image}" alt="${isClone ? '' : project.alt}" decoding="async" draggable="false">
        <span class="expanding-panel-shade" aria-hidden="true"></span>
        <span class="expanding-panel-number">${String(index + 1).padStart(2, '0')} / ${total}</span>
        <span class="expanding-panel-caption">
          <span class="expanding-panel-type">${project.type}</span>
          <span class="expanding-panel-title">${project.title}</span>
          <span class="expanding-panel-local">${project.local}</span>
          <span class="expanding-panel-note">${project.note}</span>
          <span class="expanding-panel-open">VIEW PROJECT ↗</span>
        </span>
      </a>`;
    if (isClone) { panel.inert = true; panel.setAttribute('aria-hidden', 'true'); }
    const link = panel.querySelector('.expanding-panel-link');
    panel.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') activate(panel);
    });
    link.addEventListener('focus', () => {
      if (!link.matches(':focus-visible')) return;
      focusPause = true;
      viewport.scrollLeft = 0;
      const left = panel.offsetLeft;
      if (left < x || left + itemW > x + viewport.clientWidth) x = Math.max(0, left - itemW);
      applyTransform();
      activate(panel);
    });
    link.addEventListener('click', event => {
      if (suppressClick) { event.preventDefault(); suppressClick = false; return; }
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches && !panel.classList.contains('is-active')) {
        event.preventDefault();
        activate(panel);
        touchHoldUntil = performance.now() + TOUCH_HOLD;
      }
    });
    return panel;
  };

  /* ---------- レイアウト ---------- */
  const measure = () => {
    const width = viewport.clientWidth;
    itemW = Math.round(width * (isMobile() ? 0.46 : 0.30));
    const activeW = Math.round(width * (isMobile() ? 0.82 : 0.58));
    loopW = itemW * total;
    viewport.style.setProperty('--item-w', `${itemW}px`);
    viewport.style.setProperty('--item-w-active', `${activeW}px`);
  };

  const applyTransform = () => {
    track.style.transform = `translate3d(${-x}px,0,0)`;
  };

  const render = () => {
    measure();
    track = document.createElement('div');
    track.className = 'works-marquee-track';
    for (let set = 0; set < 2; set++) {
      projects.forEach((project, index) => track.appendChild(makePanel(project, index, set > 0)));
    }
    viewport.replaceChildren(track);
    // 位置は、どちら側へ動かしても空白が出ない範囲に置く
    x = itemW * 2;
    applyTransform();
    updateCount();
  };

  const updateCount = () => {
    if (!countLabel || !itemW) return;
    const center = Math.floor((x + viewport.clientWidth / 2) / itemW);
    const index = wrapIndex(center);
    if (index === shownIndex) return;
    shownIndex = index;
    countLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${total}`;
  };

  /* ---------- アニメーションループ ---------- */
  const shouldRun = () => autoplayOn && !hoverPause && !focusPause && !dragging
    && inView && !document.hidden && performance.now() > touchHoldUntil;

  const tick = now => {
    if (!running) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
    lastTime = now;

    const target = shouldRun() && now > settleUntil - 100 ? SPEED : 0;
    speedNow += (target - speedNow) * (1 - Math.exp(-dt * 6));
    if (Math.abs(speedNow - target) < 0.5) speedNow = target;

    let step = speedNow * dt;
    if (Math.abs(nudgeLeft) > 0.5) {
      const part = nudgeLeft * (1 - Math.exp(-dt * 8));
      nudgeLeft -= part;
      step += part;
    } else {
      nudgeLeft = 0;
    }
    if (step !== 0) {
      x += step;
      // 展開中のパネルがなく、アニメーションも落ち着いているときだけ位置をループさせる
      if (!track.querySelector('.is-active') && now > settleUntil) {
        if (x >= loopW + itemW * 2) x -= loopW;
        else if (x < itemW * 2) x += loopW;
      }
      applyTransform();
      updateCount();
    }
    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  };
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
  const syncLoop = () => {
    if (inView && !document.hidden) startLoop(); else stopLoop();
  };

  /* ---------- 操作 ---------- */
  const nudge = direction => {
    clearActive();
    nudgeLeft += direction * itemW;
    touchHoldUntil = performance.now() + 1200;
  };
  prevButton.addEventListener('click', () => nudge(-1));
  nextButton.addEventListener('click', () => nudge(1));

  const syncToggle = () => {
    if (!toggleButton) return;
    toggleButton.textContent = autoplayOn ? '❚❚' : '▶';
    toggleButton.setAttribute('aria-pressed', String(autoplayOn));
    toggleButton.setAttribute('aria-label', autoplayOn ? '自動再生を停止' : '自動再生を開始');
  };
  if (toggleButton) {
    toggleButton.addEventListener('click', () => { autoplayOn = !autoplayOn; syncToggle(); });
  }

  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); nudge(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); nudge(1); }
  });
  // フォーカスで勝手にスクロールされないようにする
  viewport.addEventListener('scroll', () => { viewport.scrollLeft = 0; });

  /* ---------- ドラッグ / スワイプ ---------- */
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    pointerStartX = pointerLastX = event.clientX;
  });
  viewport.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId) return;
    if (!dragging && Math.abs(event.clientX - pointerStartX) > 8) {
      dragging = true;
      nudgeLeft = 0;
      clearActive();
      track.classList.add('is-dragging');
      try { viewport.setPointerCapture(pointerId); } catch (error) { /* noop */ }
    }
    if (dragging) {
      x -= event.clientX - pointerLastX;
      if (x >= loopW + itemW * 2) x -= loopW;
      else if (x < itemW * 2) x += loopW;
      applyTransform();
      updateCount();
    }
    pointerLastX = event.clientX;
  });
  const finishPointer = event => {
    if (pointerId !== event.pointerId) return;
    if (dragging) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 450);
      track.classList.remove('is-dragging');
      touchHoldUntil = performance.now() + (event.pointerType === 'mouse' ? 600 : 1500);
    }
    dragging = false;
    pointerId = null;
  };
  viewport.addEventListener('pointerup', finishPointer);
  viewport.addEventListener('pointercancel', finishPointer);

  /* ---------- 一時停止の条件 ---------- */
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') hoverPause = true;
  });
  carousel.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hoverPause = false;
    touchHoldUntil = Math.max(touchHoldUntil, performance.now() + RESUME_DELAY);
  });
  viewport.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !dragging) clearActive();
  });
  carousel.addEventListener('focusout', () => {
    focusPause = false;
    touchHoldUntil = Math.max(touchHoldUntil, performance.now() + RESUME_DELAY);
  });
  // タッチ端末では、ほかの場所をタップしたら閉じて再開
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && !viewport.contains(event.target)) clearActive();
  });
  document.addEventListener('visibilitychange', syncLoop);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncLoop();
    }, { threshold: 0.1 }).observe(carousel);
  } else {
    inView = true;
  }

  /* ---------- リサイズ ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const progress = itemW ? x / itemW : 2;
      clearActive();
      measure();
      x = progress * itemW;
      applyTransform();
    }, 160);
  });

  syncToggle();
  render();
  syncLoop();
})();
