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
const volatileProgress = new Map();

function readProgress(key, fallback = null) {
  try {
    const value = window.localStorage?.getItem(key);
    return value === null || value === undefined ? (volatileProgress.get(key) ?? fallback) : value;
  } catch (_) {
    return volatileProgress.get(key) ?? fallback;
  }
}

function writeProgress(key, value) {
  const text = String(value);
  volatileProgress.set(key, text);
  try { window.localStorage?.setItem(key, text); } catch (_) {}
}

function validStoredPage(value, fallback = null) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= total ? number : fallback;
}

let finished = STORY.publicationComplete && readProgress('vt2237-complete') === 'true';
let current = validStoredPage(readProgress('vt2237-progress', 1), 1);
let open = false;
let fullscreenRequested = false;
let touchIdentifier = null;
let touchX = 0;
let touchY = 0;
let controlsTimer = 0;
let turnTimer = 0;
let viewportTimer = 0;
let shareTimer = 0;
let shareOperation = 0;
let sharePending = false;
let printOperation = 0;
let printPending = false;
let suppressTapUntil = 0;
let finishReadyAt = 0;
let lastFocused = null;
let readerSession = 0;
let workerRefreshPending = false;

const pageByNumber = new Map(STORY.pages.map(page => [page.number, page]));
const chapterForPage = number => STORY.chapters.find(chapter => number >= chapter.startPage && number <= chapter.endPage);
const backgroundContent = [...document.querySelectorAll('.site-header, main, footer')];
const standaloneMode = window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true;
const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

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
  if (document.hidden || (typeof document.hasFocus === 'function' && !document.hasFocus())) {
    throw new Error('document inactive');
  }
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url);
      return;
    } catch (_) {}
  }
  if (document.hidden || (typeof document.hasFocus === 'function' && !document.hasFocus())) {
    throw new Error('document inactive');
  }
  const previousFocus = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = url;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.tabIndex = -1;
  textarea.style.position = 'fixed';
  textarea.style.inset = '-9999px auto auto -9999px';
  textarea.style.opacity = '0';
  let copied = false;
  try {
    document.body.appendChild(textarea);
    textarea.select();
    copied = Boolean(document.execCommand?.('copy'));
  } finally {
    textarea.remove();
    if (!document.hidden && previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
  }
  if (!copied) throw new Error('copy unavailable');
}

function resetShareFeedback({cancelPending = true} = {}) {
  if (cancelPending) shareOperation += 1;
  clearTimeout(shareTimer);
  shareTimer = 0;
  shareStatus.textContent = '';
  shareButton.classList.remove('share-success');
  if (sharePending) {
    shareButton.textContent = '…';
    shareButton.setAttribute('aria-label', 'Đang mở bảng chia sẻ');
  } else {
    shareButton.textContent = '↗';
    shareButton.setAttribute('aria-label', 'Chia sẻ trang hiện tại');
  }
}

function setSharePending(value) {
  sharePending = value;
  shareButton.disabled = value;
  shareButton.classList.toggle('share-pending', value);
  shareButton.setAttribute('aria-busy', String(value));
  if (value) {
    shareButton.textContent = '…';
    shareButton.setAttribute('aria-label', 'Đang mở bảng chia sẻ');
  } else {
    if (shareButton.textContent === '…') shareButton.textContent = '↗';
    if (shareButton.getAttribute('aria-label') === 'Đang mở bảng chia sẻ') {
      shareButton.setAttribute('aria-label', 'Chia sẻ trang hiện tại');
    }
  }
}

function nativeShareData(data) {
  if (typeof navigator.share !== 'function') return null;
  if (typeof navigator.canShare !== 'function') return data;
  const candidates = [data, {title: data.title, url: data.url}, {url: data.url}];
  for (const candidate of candidates) {
    try { if (navigator.canShare(candidate)) return candidate; } catch (_) {}
  }
  return null;
}

function showShareStatus(message, success = true) {
  if (!open || document.hidden) return;
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
  if (!open || document.hidden || sharePending) return;
  setSharePending(true);
  const operation = ++shareOperation;
  const session = readerSession;
  const pageNumber = current;
  const page = pageByNumber.get(current);
  const url = shareUrl();
  const data = {
    title: `${STORY.title} — Trang ${pageNumber}: ${page.title}`,
    text: `Đọc ${STORY.title}, trang ${pageNumber}: ${page.title}`,
    url
  };
  const contextIsCurrent = () => open && operation === shareOperation && session === readerSession && pageNumber === current;
  const nativeData = nativeShareData(data);
  try {
    if (nativeData) {
      try {
        await navigator.share(nativeData);
        if (contextIsCurrent()) showShareStatus(`Đã chia sẻ trang ${pageNumber}.`);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
        if (!contextIsCurrent() || document.hidden) return;
      }
    }
    try {
      await copyLink(url);
      if (contextIsCurrent()) showShareStatus(`Đã sao chép liên kết trang ${pageNumber}.`);
    } catch (_) {
      if (contextIsCurrent()) showShareStatus('Không thể sao chép. Liên kết vẫn có trên thanh địa chỉ.', false);
    }
  } finally {
    setSharePending(false);
  }
}

function clearPrintMode() {
  document.body.classList.remove('print-page');
}

function setPrintPending(value) {
  printPending = value;
  printButton.disabled = value;
  printButton.setAttribute('aria-busy', String(value));
  printButton.textContent = value ? '…' : '⎙';
  printButton.setAttribute('aria-label', value ? 'Đang chuẩn bị trang để in' : 'In hoặc lưu trang hiện tại');
  printButton.title = value ? 'Đang chuẩn bị in' : 'In hoặc lưu trang';
}

function cancelPendingPrint() {
  printOperation += 1;
  setPrintPending(false);
  clearPrintMode();
}

async function printCurrentPage() {
  if (!open || printPending) return;
  const operation = ++printOperation;
  const session = readerSession;
  const pageNumber = current;
  const contextIsCurrent = () => open && operation === printOperation && session === readerSession && pageNumber === current;
  setPrintPending(true);
  document.body.classList.add('print-page');
  fullscreenRequested = false;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  try {
    if (contextIsCurrent()) window.print();
  } catch (_) {
  } finally {
    clearPrintMode();
    if (operation === printOperation) setPrintPending(false);
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
  const currentChapter = chapterForPage(current);
  writeProgress('vt2237-progress', current);
  document.title = `${currentPage.title} · Chương ${currentChapter.number} · Trang ${current}/${total} — ${STORY.title}`;
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
  const endLabel = STORY.publicationComplete ? 'Hoàn tất tập và thoát' : 'Đã đọc đến trang mới nhất và thoát';
  nextButton.setAttribute('aria-label', atEnd ? endLabel : 'Trang sau');
  nextButton.title = atEnd ? endLabel : 'Trang sau';
  updateReadLabel();
  preload(current - 1);
  preload(current + 1);
  if (open && history.state?.vt2237Reader) syncReaderHistory('replace');
  if (direction) animateTurn(direction);
}

function clearTurnAnimation() {
  clearTimeout(turnTimer);
  turnTimer = 0;
  stage.classList.remove('turn-next', 'turn-prev');
}

function animateTurn(direction) {
  clearTurnAnimation();
  if (reducedMotionQuery?.matches) return;
  void stage.offsetWidth;
  stage.classList.add(direction > 0 ? 'turn-next' : 'turn-prev');
  turnTimer = setTimeout(clearTurnAnimation, 400);
}

function handleTurnAnimationEnd(event) {
  const activeImage = comic.querySelector('.comic-page.active img');
  if (event.target !== activeImage || !event.animationName?.startsWith('page-in-')) return;
  clearTurnAnimation();
}

function handleReducedMotionChange(event) {
  if (event.matches) clearTurnAnimation();
}

function updateReadLabel() {
  document.querySelector('#readLabel').textContent = current > 1 ? `Đọc tiếp · Trang ${current}` : finished ? 'Đọc lại từ đầu' : 'Đọc ngay';
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

function advance() {
  if (!open) return;
  if (current === total) return finishChapter();
  step(1);
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
  clearTurnAnimation();
  preload(current - 1);
  preload(current + 1);
  showControls();
}

function queueViewportRefresh() {
  clearTimeout(viewportTimer);
  resetShareFeedback();
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
  resetShareFeedback();
  resetTouchGesture();
  suppressTapUntil = 0;
  finishReadyAt = 0;
  clearTurnAnimation();
  reader.classList.remove('controls-hidden');
  cancelPendingPrint();
  comic.replaceChildren();
  document.head.querySelectorAll('[data-preload]').forEach(link => link.remove());
}

function resetTouchGesture() {
  touchIdentifier = null;
  touchX = 0;
  touchY = 0;
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
  cancelPendingPrint();
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
  refreshForWorkerWhenSafe();
}

function refreshForWorkerWhenSafe() {
  if (!workerRefreshPending || open || document.hidden) return false;
  workerRefreshPending = false;
  location.reload();
  return true;
}

function finishChapter() {
  if (!open || current !== total || performance.now() < finishReadyAt) return showControls();
  if (STORY.publicationComplete) {
    finished = true;
    current = 1;
    writeProgress('vt2237-complete', 'true');
    writeProgress('vt2237-progress', 1);
  } else {
    writeProgress('vt2237-complete', 'false');
    writeProgress('vt2237-progress', current);
  }
  updateReadLabel();
  closeReader();
}

const completedChapters = STORY.chapters.filter(chapter => chapter.complete).length;
document.querySelector('#releaseStatus').textContent = `${completedChapters} chương hoàn tất · ${total} trang`;
document.querySelectorAll('[data-start-page]').forEach(button => {
  const start = Number(button.dataset.startPage);
  const chapter = STORY.chapters.find(item => item.startPage === start);
  const count = chapter.endPage - chapter.startPage + 1;
  button.querySelector('[data-chapter-pages]').textContent = `${count} trang${chapter.complete ? '' : ' · đang ra'} →`;
  button.addEventListener('click', () => { current = start; openReader(); });
});
updateReadLabel();
document.querySelector('#readButton').addEventListener('click', openReader);
document.querySelector('#closeReader').addEventListener('click', () => closeReader());
shareButton.addEventListener('click', shareCurrentPage);
printButton.addEventListener('click', printCurrentPage);
document.querySelector('#prevPage').addEventListener('click', () => step(-1));
nextButton.addEventListener('click', advance);
document.querySelector('#tapLeft').addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.stopPropagation(); step(-1); });
document.querySelector('#tapRight').addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.stopPropagation(); advance(); });
stage.addEventListener('click', event => { if (performance.now() < suppressTapUntil) return event.preventDefault(); if (!event.target.closest('[data-retry-page]') && (event.target === stage || event.target.closest('.comic-page'))) { reader.classList.toggle('controls-hidden'); if (!reader.classList.contains('controls-hidden')) showControls(); } });
stage.addEventListener('pointermove', showControls, {passive: true});
stage.addEventListener('animationend', handleTurnAnimationEnd);
stage.addEventListener('animationcancel', handleTurnAnimationEnd);
stage.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) return resetTouchGesture();
  const touch = event.touches[0];
  touchIdentifier = touch.identifier;
  touchX = touch.clientX;
  touchY = touch.clientY;
}, {passive: true});
stage.addEventListener('touchmove', event => {
  if (touchIdentifier === null || event.touches.length !== 1 || event.touches[0].identifier !== touchIdentifier) resetTouchGesture();
}, {passive: true});
stage.addEventListener('touchend', event => {
  if (touchIdentifier === null) return;
  const touch = Array.from(event.changedTouches).find(item => item.identifier === touchIdentifier);
  const startX = touchX;
  const startY = touchY;
  resetTouchGesture();
  if (!touch) return;
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
    event.preventDefault();
    suppressTapUntil = performance.now() + 500;
    dx < 0 ? advance() : step(-1);
  }
}, {passive: false});
stage.addEventListener('touchcancel', resetTouchGesture, {passive: true});
document.addEventListener('keydown', event => {
  if (!open) return;
  if (event.key === 'Tab') return trapReaderFocus(event);
  if (event.key === 'Escape') {
    event.preventDefault();
    closeReader();
    return;
  }
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    advance();
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    step(-1);
    return;
  }
  if (event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  const chapter = chapterForPage(current);
  if (event.key === 'Home' && current !== chapter.startPage) {
    current = chapter.startPage;
    update(-1);
    showControls();
    return;
  }
  if (event.key === 'End' && current !== chapter.endPage) {
    current = chapter.endPage;
    update(1);
    showControls();
  }
});
document.addEventListener('fullscreenchange', () => handleFullscreenExit(document.fullscreenElement));
document.addEventListener('webkitfullscreenchange', () => handleFullscreenExit(document.webkitFullscreenElement));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return resetShareFeedback();
  if (refreshForWorkerWhenSafe()) return;
  refreshReaderViewport();
});
window.addEventListener('resize', queueViewportRefresh, {passive: true});
window.addEventListener('orientationchange', queueViewportRefresh, {passive: true});
window.visualViewport?.addEventListener('resize', queueViewportRefresh, {passive: true});
if (reducedMotionQuery?.addEventListener) reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
else reducedMotionQuery?.addListener?.(handleReducedMotionChange);
window.addEventListener('online', () => { if (open && comic.querySelector(`.comic-page[data-page="${current}"].load-failed`)) retryPage(current); });
window.addEventListener('offline', () => { comic.querySelectorAll('.comic-page.load-failed').forEach(page => setPageLoadState(Number(page.dataset.page), true)); });
window.addEventListener('afterprint', clearPrintMode);
window.addEventListener('storage', event => {
  if (event.key === null) {
    volatileProgress.clear();
    finished = false;
    if (!open) current = 1;
    updateReadLabel();
    return;
  }
  if (event.key === 'vt2237-complete') {
    if (event.newValue !== null && event.newValue !== 'true' && event.newValue !== 'false') return;
    finished = STORY.publicationComplete && event.newValue === 'true';
    volatileProgress.set(event.key, String(finished));
    updateReadLabel();
    return;
  }
  if (event.key !== 'vt2237-progress') return;
  const incomingPage = event.newValue === null ? 1 : validStoredPage(event.newValue);
  if (!incomingPage) return;
  volatileProgress.set(event.key, String(incomingPage));
  if (!open) {
    current = incomingPage;
    updateReadLabel();
  }
});
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
    workerRefreshPending = true;
    refreshForWorkerWhenSafe();
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
