const reader = document.querySelector('#reader');
const stage = document.querySelector('#readerStage');
const comic = document.querySelector('#comic');
const nextButton = document.querySelector('#nextPage');
const total = STORY.pages.length;
const baseDocumentTitle = document.title;
let finished = localStorage.getItem('vt2237-complete') === 'true';
const savedProgress = Number(localStorage.getItem('vt2237-progress') || 1);
let current = Number.isInteger(savedProgress) && savedProgress >= 1 && savedProgress <= total ? savedProgress : 1;
let open = false;
let fullscreenRequested = false;
let touchX = 0;
let touchY = 0;
let controlsTimer = 0;
let turnTimer = 0;
let viewportTimer = 0;
let suppressTapUntil = 0;
let finishReadyAt = 0;
let lastFocused = null;

const pageByNumber = new Map(STORY.pages.map(page => [page.number, page]));
const backgroundContent = [...document.querySelectorAll('.site-header, main, footer')];

function render() {
  comic.innerHTML = STORY.pages.map(page => `<section class="comic-page${page.number === current ? ' active' : ''}" data-page="${page.number}" aria-hidden="${page.number !== current}" aria-busy="true"><img src="${page.image}" alt="${page.alt}" loading="${Math.abs(page.number - current) <= 1 ? 'eager' : 'lazy'}" decoding="async" data-page-image="${page.number}"><div class="page-error" data-page-error="${page.number}" role="alert" hidden><strong>Không tải được trang ${page.number}</strong><span data-page-error-message>Kiểm tra kết nối rồi thử lại.</span><button type="button" data-retry-page="${page.number}">Tải lại trang</button></div></section>`).join('');
  bindPageImages();
  update();
}

function bindPageImages() {
  comic.querySelectorAll('[data-page-image]').forEach(image => {
    const number = Number(image.dataset.pageImage);
    image.addEventListener('load', () => setPageLoadState(number, false));
    image.addEventListener('error', () => setPageLoadState(number, true));
    if (image.complete) setPageLoadState(number, image.naturalWidth === 0);
  });
  comic.querySelectorAll('[data-retry-page]').forEach(button => {
    button.addEventListener('click', () => retryPage(Number(button.dataset.retryPage)));
  });
}

function setPageLoadState(number, failed) {
  const page = comic.querySelector(`.comic-page[data-page="${number}"]`);
  if (!page) return;
  const error = page.querySelector('[data-page-error]');
  page.classList.toggle('load-failed', failed);
  page.setAttribute('aria-busy', 'false');
  error.hidden = !failed;
  if (failed) error.querySelector('[data-page-error-message]').textContent = navigator.onLine ? 'Kết nối chập chờn. Hãy thử tải lại trang.' : 'Thiết bị đang ngoại tuyến. Trang sẽ thử lại khi có mạng.';
}

function retryPage(number) {
  const pageData = pageByNumber.get(number);
  const page = comic.querySelector(`.comic-page[data-page="${number}"]`);
  const image = page?.querySelector('[data-page-image]');
  if (!pageData || !page || !image) return;
  page.classList.remove('load-failed');
  page.querySelector('[data-page-error]').hidden = true;
  page.setAttribute('aria-busy', 'true');
  const retryUrl = new URL(pageData.image, document.baseURI);
  retryUrl.searchParams.set('retry', Date.now());
  image.src = retryUrl.href;
}

function update(direction = 0) {
  comic.querySelectorAll('.comic-page').forEach(page => {
    const active = Number(page.dataset.page) === current;
    page.classList.toggle('active', active);
    page.setAttribute('aria-hidden', String(!active));
  });
  const currentPage = pageByNumber.get(current);
  localStorage.setItem('vt2237-progress', current);
  document.title = `${currentPage.title} · Trang ${current}/${total} — ${STORY.title}`;
  document.querySelector('#pageCounter').textContent = `Trang ${current} / ${total}`;
  stage.setAttribute('aria-label', `Trang ${current} trên ${total}: ${currentPage.title}`);
  document.querySelector('#progressBar').style.width = `${current / total * 100}%`;
  document.querySelector('#prevPage').disabled = current === 1;
  const atEnd = current === total;
  const wasAtEnd = nextButton.classList.contains('chapter-finish');
  nextButton.classList.toggle('chapter-finish', atEnd);
  finishReadyAt = atEnd ? (wasAtEnd ? finishReadyAt : performance.now() + 320) : 0;
  nextButton.textContent = atEnd ? '✓' : '›';
  nextButton.setAttribute('aria-label', atEnd ? 'Hoàn tất chương và thoát' : 'Trang sau');
  nextButton.title = atEnd ? 'Hoàn tất chương' : 'Trang sau';
  updateReadLabel();
  preload(current - 1);
  preload(current + 1);
  if (direction) animateTurn(direction);
}

function animateTurn(direction) {
  clearTimeout(turnTimer);
  stage.classList.remove('turn-next', 'turn-prev');
  void stage.offsetWidth;
  stage.classList.add(direction > 0 ? 'turn-next' : 'turn-prev');
  turnTimer = setTimeout(() => stage.classList.remove('turn-next', 'turn-prev'), 280);
}

function updateReadLabel() {
  document.querySelector('#readLabel').textContent = current > 1 ? `Đọc tiếp · Trang ${current}` : finished ? 'Đọc lại chương' : 'Đọc ngay';
}

function preload(number) {
  const page = pageByNumber.get(number);
  if (!page || document.head.querySelector(`[data-preload="${number}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload'; link.as = 'image'; link.href = page.image; link.dataset.preload = number;
  document.head.appendChild(link);
}

function step(direction) {
  if (!open) return;
  const next = current + direction;
  if (!pageByNumber.has(next)) return showControls();
  current = next;
  update(direction);
  showControls();
}

function showControls() {
  reader.classList.remove('controls-hidden');
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(() => { if (!document.activeElement?.closest('.reader-nav, .page-error')) reader.classList.add('controls-hidden'); }, 2600);
}

function readerFocusOrder() {
  const order = [stage];
  const retry = comic.querySelector('.comic-page.active.load-failed [data-retry-page]');
  if (retry) order.push(retry);
  order.push(...reader.querySelectorAll('.reader-nav button:not(:disabled)'));
  return order;
}

function trapReaderFocus(event) {
  const order = readerFocusOrder();
  const index = order.indexOf(document.activeElement);
  const nextIndex = event.shiftKey ? (index <= 0 ? order.length - 1 : index - 1) : (index < 0 || index === order.length - 1 ? 0 : index + 1);
  event.preventDefault();
  showControls();
  order[nextIndex].focus({preventScroll: true});
}

function setBackgroundInert(value) {
  backgroundContent.forEach(element => { element.inert = value; });
}

function refreshReaderViewport() {
  if (!open) return;
  stage.classList.remove('turn-next', 'turn-prev');
  preload(current - 1);
  preload(current + 1);
  showControls();
}

function queueViewportRefresh() {
  clearTimeout(viewportTimer);
  viewportTimer = setTimeout(refreshReaderViewport, 80);
}

function handleFullscreenExit(fullscreenElement) {
  if (!fullscreenRequested || fullscreenElement) return;
  fullscreenRequested = false;
  refreshReaderViewport();
}

async function enterFullscreen() {
  const request = reader.requestFullscreen || reader.webkitRequestFullscreen;
  if (!request) return;
  try { fullscreenRequested = true; await request.call(reader, {navigationUI: 'hide'}); }
  catch (_) { fullscreenRequested = false; }
}

async function openReader() {
  lastFocused = document.activeElement;
  open = true;
  reader.hidden = false;
  setBackgroundInert(true);
  document.body.classList.add('reader-open');
  render();
  await enterFullscreen();
  showControls();
  stage.focus({preventScroll: true});
}

async function closeReader() {
  if (!open) return;
  open = false;
  fullscreenRequested = false;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  reader.hidden = true;
  setBackgroundInert(false);
  document.body.classList.remove('reader-open');
  document.title = baseDocumentTitle;
  if (lastFocused?.isConnected) lastFocused.focus({preventScroll: true});
}

function finishChapter() {
  if (!open || current !== total || performance.now() < finishReadyAt) return showControls();
  finished = true;
  current = 1;
  localStorage.setItem('vt2237-complete', 'true');
  localStorage.setItem('vt2237-progress', '1');
  updateReadLabel();
  closeReader();
}

document.querySelector('#releaseStatus').textContent = `${STORY.chapterComplete ? '1 chương hoàn tất' : '1 chương'} · ${total} trang`;
document.querySelector('#chapterPages').textContent = `${total} trang →`;
updateReadLabel();
document.querySelector('#readButton').addEventListener('click', openReader);
document.querySelector('#openChapter').addEventListener('click', () => { current = 1; openReader(); });
document.querySelector('#closeReader').addEventListener('click', () => closeReader());
document.querySelector('#prevPage').addEventListener('click', () => step(-1));
nextButton.addEventListener('click', () => { if (!open) return; current === total ? finishChapter() : step(1); });
document.querySelector('#tapLeft').addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.stopPropagation(); step(-1); });
document.querySelector('#tapRight').addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.stopPropagation(); step(1); });
stage.addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.preventDefault(); if (!event.target.closest('[data-retry-page]') && (event.target === stage || event.target.closest('.comic-page'))) { reader.classList.toggle('controls-hidden'); if (!reader.classList.contains('controls-hidden')) showControls(); } });
stage.addEventListener('pointermove', showControls, {passive: true});
stage.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; touchY = event.changedTouches[0].clientY; }, {passive: true});
stage.addEventListener('touchend', event => { const dx = event.changedTouches[0].clientX - touchX; const dy = event.changedTouches[0].clientY - touchY; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) { event.preventDefault(); suppressTapUntil = performance.now() + 500; step(dx < 0 ? 1 : -1); } }, {passive: false});
document.addEventListener('keydown', event => { if (!open) return; if (event.key === 'Tab') return trapReaderFocus(event); if (event.key === 'Escape') { event.preventDefault(); closeReader(); return; } if (event.key === 'ArrowRight' || event.key === 'PageDown') step(1); if (event.key === 'ArrowLeft' || event.key === 'PageUp') step(-1); if (event.key === 'Home' && current !== 1) { current = 1; update(-1); showControls(); } if (event.key === 'End' && current !== total) { current = total; update(1); showControls(); } });
document.addEventListener('fullscreenchange', () => handleFullscreenExit(document.fullscreenElement));
document.addEventListener('webkitfullscreenchange', () => handleFullscreenExit(document.webkitFullscreenElement));
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshReaderViewport(); });
window.addEventListener('resize', queueViewportRefresh, {passive: true});
window.addEventListener('orientationchange', queueViewportRefresh, {passive: true});
window.visualViewport?.addEventListener('resize', queueViewportRefresh, {passive: true});
window.addEventListener('online', () => { if (open && comic.querySelector(`.comic-page[data-page="${current}"].load-failed`)) retryPage(current); });
window.addEventListener('offline', () => { comic.querySelectorAll('.comic-page.load-failed').forEach(page => setPageLoadState(Number(page.dataset.page), true)); });
