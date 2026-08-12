const reader = document.querySelector('#reader');
const stage = document.querySelector('#readerStage');
const comic = document.querySelector('#comic');
const nextButton = document.querySelector('#nextPage');
const shareButton = document.querySelector('#sharePage');
const printButton = document.querySelector('#printPage');
const pageCounter = document.querySelector('#pageCounter');
const shareStatus = document.querySelector('#shareStatus');
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
let shareTimer = 0;
let suppressTapUntil = 0;
let finishReadyAt = 0;
let lastFocused = null;
let readerSession = 0;

const pageByNumber = new Map(STORY.pages.map(page => [page.number, page]));
const backgroundContent = [...document.querySelectorAll('.site-header, main, footer')];
const standaloneMode = window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true;

if (standaloneMode) {
  const appScopePath = new URL('./', location.href).pathname;
  document.querySelectorAll('a[href]').forEach(link => {
    const target = new URL(link.getAttribute('href'), location.href);
    const insideScope = target.origin === location.origin && target.pathname.startsWith(appScopePath);
    if (insideScope) return;
    link.target = '_blank';
    link.rel = [...new Set(`${link.rel} external noopener`.trim().split(/\s+/))].join(' ');
    link.title ||= 'Mở trong trình duyệt';
  });
}

function pageFromLocation() {
  const value = Number(new URL(location.href).searchParams.get('page'));
  return Number.isInteger(value) && pageByNumber.has(value) ? value : null;
}

function locationForPage(number) {
  const url = new URL(location.href);
  url.searchParams.set('page', number);
  return `${url.pathname}${url.search}${url.hash}`;
}

function locationWithoutPage() {
  const url = new URL(location.href);
  url.searchParams.delete('page');
  return `${url.pathname}${url.search}${url.hash}`;
}

function readerHistoryState(origin = history.state?.vt2237Origin || 'deep-link') {
  return {...(history.state || {}), vt2237Reader: true, vt2237Origin: origin, page: current};
}

function syncReaderHistory(mode, origin) {
  history[`${mode}State`](readerHistoryState(origin), '', locationForPage(current));
}

function clearReaderHistory() {
  const state = {...(history.state || {})};
  delete state.vt2237Reader;
  delete state.vt2237Origin;
  delete state.page;
  history.replaceState(state, '', locationWithoutPage());
}

function shareUrl() {
  return new URL(locationForPage(current), location.origin).href;
}

async function copyLink(url) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url);
      return;
    } catch (_) {}
  }
  const textarea = document.createElement('textarea');
  textarea.value = url;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand?.('copy');
  textarea.remove();
  shareButton.focus({preventScroll: true});
  if (!copied) throw new Error('copy unavailable');
}

function showShareStatus(message, success = true) {
  clearTimeout(shareTimer);
  shareStatus.textContent = message;
  shareButton.textContent = success ? '✓' : '!';
  shareButton.classList.toggle('share-success', success);
  shareButton.setAttribute('aria-label', message);
  shareTimer = setTimeout(() => {
    shareStatus.textContent = '';
    shareButton.textContent = '↗';
    shareButton.classList.remove('share-success');
    shareButton.setAttribute('aria-label', 'Chia sẻ trang hiện tại');
  }, 1800);
}

async function shareCurrentPage() {
  const page = pageByNumber.get(current);
  const url = shareUrl();
  const data = {
    title: `${STORY.title} — Trang ${current}: ${page.title}`,
    text: `Đọc ${STORY.title}, trang ${current}: ${page.title}`,
    url
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      showShareStatus(`Đã chia sẻ trang ${current}.`);
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  try {
    await copyLink(url);
    showShareStatus(`Đã sao chép liên kết trang ${current}.`);
  } catch (_) {
    showShareStatus('Không thể sao chép. Liên kết vẫn có trên thanh địa chỉ.', false);
  }
}

function clearPrintMode() {
  document.body.classList.remove('print-page');
}

async function printCurrentPage() {
  if (!open) return;
  document.body.classList.add('print-page');
  fullscreenRequested = false;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  try {
    window.print();
  } catch (_) {
    clearPrintMode();
  }
}

function render() {
  comic.innerHTML = STORY.pages.map(page => `<section class="comic-page${page.number === current ? ' active' : ''}" data-page="${page.number}" aria-hidden="${page.number !== current}" aria-busy="true"><img src="${page.image}" alt="${page.alt}" loading="${page.number === current ? 'eager' : 'lazy'}" fetchpriority="${page.number === current ? 'high' : 'low'}" decoding="async" data-page-image="${page.number}"><div class="page-error" data-page-error="${page.number}" role="alert" hidden><strong>Không tải được trang ${page.number}</strong><span data-page-error-message>Kiểm tra kết nối rồi thử lại.</span><button type="button" data-retry-page="${page.number}">Tải lại trang</button></div></section>`).join('');
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
    const image = page.querySelector('[data-page-image]');
    image.setAttribute('loading', active ? 'eager' : 'lazy');
    image.setAttribute('fetchpriority', active ? 'high' : 'low');
  });
  const currentPage = pageByNumber.get(current);
  localStorage.setItem('vt2237-progress', current);
  document.title = `${currentPage.title} · Trang ${current}/${total} — ${STORY.title}`;
  pageCounter.textContent = `${current} / ${total}`;
  pageCounter.setAttribute('aria-label', `Trang ${current} trên ${total}`);
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
  if (open && history.state?.vt2237Reader) syncReaderHistory('replace');
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
  link.rel = 'preload'; link.as = 'image'; link.href = page.image; link.setAttribute('fetchpriority', 'low'); link.dataset.preload = number;
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
  clearTimeout(shareTimer);
  viewportTimer = setTimeout(refreshReaderViewport, 80);
}

function handleFullscreenExit(fullscreenElement) {
  if (!fullscreenRequested || fullscreenElement) return;
  fullscreenRequested = false;
  refreshReaderViewport();
}

function cleanupReader() {
  clearTimeout(controlsTimer);
  clearTimeout(turnTimer);
  clearTimeout(viewportTimer);
  controlsTimer = 0;
  turnTimer = 0;
  viewportTimer = 0;
  shareTimer = 0;
  touchX = 0;
  touchY = 0;
  suppressTapUntil = 0;
  finishReadyAt = 0;
  stage.classList.remove('turn-next', 'turn-prev');
  reader.classList.remove('controls-hidden');
  shareStatus.textContent = '';
  shareButton.textContent = '↗';
  shareButton.classList.remove('share-success');
  shareButton.setAttribute('aria-label', 'Chia sẻ trang hiện tại');
  clearPrintMode();
  comic.replaceChildren();
  document.head.querySelectorAll('[data-preload]').forEach(link => link.remove());
}

async function enterFullscreen() {
  const request = reader.requestFullscreen || reader.webkitRequestFullscreen;
  if (!request) return;
  try { fullscreenRequested = true; await request.call(reader, {navigationUI: 'hide'}); }
  catch (_) { fullscreenRequested = false; }
}

async function openReader({requestNativeFullscreen = true, historyMode = 'push'} = {}) {
  const session = ++readerSession;
  lastFocused = document.activeElement;
  open = true;
  if (historyMode === 'push') syncReaderHistory('push', 'pushed');
  reader.hidden = false;
  setBackgroundInert(true);
  document.body.classList.add('reader-open');
  render();
  if (requestNativeFullscreen) await enterFullscreen();
  if (!open || session !== readerSession) {
    if (!open && (document.fullscreenElement === reader || document.webkitFullscreenElement === reader)) {
      try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
    }
    return;
  }
  showControls();
  stage.focus({preventScroll: true});
}

async function closeReader({historyMode = 'auto'} = {}) {
  if (!open) return;
  if (historyMode === 'auto' && history.state?.vt2237Reader) {
    if (history.state.vt2237Origin === 'pushed') {
      history.back();
      return;
    }
    clearReaderHistory();
  }
  const session = ++readerSession;
  open = false;
  fullscreenRequested = false;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  if (session !== readerSession) return;
  reader.hidden = true;
  setBackgroundInert(false);
  document.body.classList.remove('reader-open');
  document.title = baseDocumentTitle;
  cleanupReader();
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
shareButton.addEventListener('click', shareCurrentPage);
printButton.addEventListener('click', printCurrentPage);
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
window.addEventListener('afterprint', clearPrintMode);
window.addEventListener('popstate', () => {
  const linkedPage = pageFromLocation();
  if (linkedPage) {
    const direction = linkedPage === current ? 0 : linkedPage > current ? 1 : -1;
    current = linkedPage;
    if (open) {
      update(direction);
      showControls();
    } else {
      openReader({requestNativeFullscreen: false, historyMode: 'none'});
    }
  } else if (open) {
    closeReader({historyMode: 'none'});
  }
});

if ('serviceWorker' in navigator && window.isSecureContext) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshingForWorker = false;
  navigator.serviceWorker.addEventListener?.('controllerchange', () => {
    if (!hadController || refreshingForWorker) return;
    refreshingForWorker = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', {scope: './', updateViaCache: 'none'})
      .then(registration => registration.update())
      .catch(() => {});
  });
}

const linkedPage = pageFromLocation();
if (linkedPage) {
  current = linkedPage;
  syncReaderHistory('replace', 'deep-link');
  openReader({requestNativeFullscreen: false, historyMode: 'none'});
} else if (new URL(location.href).searchParams.has('page')) {
  clearReaderHistory();
}
