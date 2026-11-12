(() => {
  const panel = document.getElementById('indexPanel');
  const toggle = document.getElementById('indexToggle');
  const close = document.getElementById('indexClose');
  const scrim = document.getElementById('scrim');
  const viewer = document.getElementById('viewer');
  const viewerImage = document.getElementById('viewerImage');
  const viewerLabel = document.getElementById('viewerLabel');
  const pageImages = [...document.querySelectorAll('.page-frame img')];
  let current = 0;

  function setIndex(open) {
    panel.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.toggle-mark').textContent = open ? '×' : '＋';
  }
  toggle.addEventListener('click', () => setIndex(!panel.classList.contains('open')));
  close.addEventListener('click', () => setIndex(false));
  scrim.addEventListener('click', () => setIndex(false));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setIndex(false)));

  function showPage(index) {
    current = (index + pageImages.length) % pageImages.length;
    const source = pageImages[current];
    viewerImage.src = source.currentSrc || source.src;
    viewerImage.alt = `KAYA 作品集原始頁面 ${current + 1}`;
    viewerLabel.textContent = `PAGE ${String(current + 1).padStart(2, '0')} / ${pageImages.length}`;
  }
  function openViewer(index) {
    showPage(index);
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeViewer() {
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  pageImages.forEach((img, index) => {
    img.addEventListener('click', () => openViewer(index));
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openViewer(index); }
    });
  });
  document.getElementById('viewerClose').addEventListener('click', closeViewer);
  document.getElementById('viewerPrev').addEventListener('click', () => showPage(current - 1));
  document.getElementById('viewerNext').addEventListener('click', () => showPage(current + 1));
  viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
  document.addEventListener('keydown', event => {
    if (!viewer.classList.contains('open')) {
      if (event.key === 'Escape' && panel.classList.contains('open')) setIndex(false);
      return;
    }
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') showPage(current - 1);
    if (event.key === 'ArrowRight') showPage(current + 1);
  });
})();
