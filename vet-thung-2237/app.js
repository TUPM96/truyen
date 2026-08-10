const reader = document.querySelector('#reader');
const stage = document.querySelector('#readerStage');
const comic = document.querySelector('#comic');
const total = STORY.pages.length;
let current = Math.min(Math.max(Number(localStorage.getItem('vt2237-progress') || 1), 1), total);
let open = false;
let fullscreenRequested = false;
let touchX = 0;
let touchY = 0;
let controlsTimer = 0;

const pageByNumber = new Map(STORY.pages.map(page => [page.number, page]));

function render() {
  comic.innerHTML = STORY.pages.map(page => `<section class="comic-page${page.number === current ? ' active' : ''}" data-page="${page.number}" aria-hidden="${page.number !== current}"><img src="${page.image}" alt="${page.alt}" loading="${Math.abs(page.number - current) <= 1 ? 'eager' : 'lazy'}" decoding="async"></section>`).join('');
  update();
}

function update() {
  comic.querySelectorAll('.comic-page').forEach(page => {
    const active = Number(page.dataset.page) === current;
    page.classList.toggle('active', active);
    page.setAttribute('aria-hidden', String(!active));
  });
  const currentPage = pageByNumber.get(current);
  localStorage.setItem('vt2237-progress', current);
  document.querySelector('#pageCounter').textContent = `Trang ${current} / ${total}`;
  stage.setAttribute('aria-label', `Trang ${current} trên ${total}: ${currentPage.title}`);
  document.querySelector('#progressBar').style.width = `${current / total * 100}%`;
  document.querySelector('#prevPage').disabled = current === 1;
  document.querySelector('#nextPage').disabled = current === total;
  document.querySelector('#readLabel').textContent = current > 1 ? `Đọc tiếp · Trang ${current}` : 'Đọc ngay';
  preload(current - 1);
  preload(current + 1);
}

function preload(number) {
  const page = pageByNumber.get(number);
  if (!page || document.head.querySelector(`[data-preload="${number}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload'; link.as = 'image'; link.href = page.image; link.dataset.preload = number;
  document.head.appendChild(link);
}

function step(direction) {
  const next = current + direction;
  if (!pageByNumber.has(next)) return showControls();
  current = next;
  update();
  showControls();
}

function showControls() {
  reader.classList.remove('controls-hidden');
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(() => reader.classList.add('controls-hidden'), 2600);
}

async function enterFullscreen() {
  const request = reader.requestFullscreen || reader.webkitRequestFullscreen;
  if (!request) return;
  try { fullscreenRequested = true; await request.call(reader, {navigationUI: 'hide'}); }
  catch (_) { fullscreenRequested = false; }
}

async function openReader() {
  open = true;
  reader.hidden = false;
  document.body.classList.add('reader-open');
  render();
  await enterFullscreen();
  showControls();
  stage.focus({preventScroll: true});
}

async function closeReader(fromFullscreen = false) {
  if (!open) return;
  open = false;
  if (!fromFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  reader.hidden = true;
  document.body.classList.remove('reader-open');
}

document.querySelector('#releaseStatus').textContent = `${STORY.chapterComplete ? '1 chương hoàn tất' : '1 chương'} · ${total} trang`;
document.querySelector('#chapterPages').textContent = `${total} trang →`;
document.querySelector('#readLabel').textContent = current > 1 ? `Đọc tiếp · Trang ${current}` : 'Đọc ngay';
document.querySelector('#readButton').addEventListener('click', openReader);
document.querySelector('#openChapter').addEventListener('click', () => { current = 1; openReader(); });
document.querySelector('#closeReader').addEventListener('click', () => closeReader());
document.querySelector('#prevPage').addEventListener('click', () => step(-1));
document.querySelector('#nextPage').addEventListener('click', () => step(1));
document.querySelector('#tapLeft').addEventListener('click', () => step(-1));
document.querySelector('#tapRight').addEventListener('click', () => step(1));
stage.addEventListener('click', event => { if (event.target === stage || event.target.closest('.comic-page')) { reader.classList.toggle('controls-hidden'); if (!reader.classList.contains('controls-hidden')) showControls(); } });
stage.addEventListener('pointermove', showControls, {passive: true});
stage.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; touchY = event.changedTouches[0].clientY; }, {passive: true});
stage.addEventListener('touchend', event => { const dx = event.changedTouches[0].clientX - touchX; const dy = event.changedTouches[0].clientY - touchY; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) step(dx < 0 ? 1 : -1); }, {passive: true});
document.addEventListener('keydown', event => { if (!open) return; if (event.key === 'Escape') closeReader(); if (event.key === 'ArrowRight' || event.key === 'PageDown') step(1); if (event.key === 'ArrowLeft' || event.key === 'PageUp') step(-1); if (event.key === 'Home') { current = 1; update(); showControls(); } if (event.key === 'End') { current = total; update(); showControls(); } });
document.addEventListener('fullscreenchange', () => { if (fullscreenRequested && !document.fullscreenElement && open) { fullscreenRequested = false; closeReader(true); } });
document.addEventListener('webkitfullscreenchange', () => { if (fullscreenRequested && !document.webkitFullscreenElement && open) { fullscreenRequested = false; closeReader(true); } });
