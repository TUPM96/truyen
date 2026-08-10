const overlay = document.querySelector('#readerOverlay');
const viewport = document.querySelector('#readerViewport');
const comic = document.querySelector('#comic');
const bottomBar = document.querySelector('#readerBottom');
const drawer = document.querySelector('#readerDrawer');
const scrim = document.querySelector('#readerScrim');
const pageCounter = document.querySelector('#pageCounter');
const positionLabel = document.querySelector('#readerPosition');
const chapterTitle = document.querySelector('#readerChapterTitle');
const progressBar = document.querySelector('#readerProgressBar');
const chapterEnd = document.querySelector('#chapterEnd');

const publishedThrough = Math.min(Number(STORY.publishedThrough || 0), 52);
const allPages = STORY.chapters.flatMap((chapter, chapterIndex) =>
  chapter.pages.map(page => ({...page, chapterIndex, chapterTitle: chapter.title, chapterShort: chapter.short}))
);
const publishedPages = allPages.filter(page => page.global <= publishedThrough);
const pageByGlobal = new Map(publishedPages.map(page => [page.global, page]));

let mode = localStorage.getItem('ctp-reader-mode') === 'paged' ? 'paged' : 'vertical';
let currentGlobal = Math.min(Math.max(Number(localStorage.getItem('ctp-progress') || 1), 1), publishedThrough || 1);
let controlsTimer = 0;
let observer;
let touchStartX = 0;
let touchStartY = 0;
let readerIsOpen = false;
let requestedFullscreen = false;

const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function chapterGroups() {
  return STORY.chapters.map((chapter, index) => ({
    chapter,
    index,
    pages: chapter.pages.filter(page => page.global <= publishedThrough)
  })).filter(group => group.pages.length);
}

function buildPublicChapterList() {
  const groups = chapterGroups();
  document.querySelector('#episodeList').innerHTML = groups.map(({chapter, index, pages}) => `
    <button class="episode-row" type="button" data-open-chapter="${index}" data-page="${pages[0].global}">
      <span class="episode-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="episode-copy"><strong>${escapeHTML(chapter.title)}</strong><small>${escapeHTML(chapter.opening)}</small></span>
      <span class="episode-pages">${pages.length} trang <b>→</b></span>
    </button>`).join('');
  document.querySelector('#drawerChapters').innerHTML = groups.map(({chapter, index, pages}) => `
    <button type="button" data-open-chapter="${index}" data-page="${pages[0].global}">
      <span>CHƯƠNG ${index + 1}</span><strong>${escapeHTML(chapter.title)}</strong><small>${pages.length} trang</small>
    </button>`).join('');
  document.querySelector('#releaseStatus').textContent = `${groups.length} chương · ${publishedPages.length} trang`;
  document.querySelectorAll('[data-open-chapter]').forEach(button => button.addEventListener('click', () => {
    currentGlobal = Number(button.dataset.page);
    closeDrawer();
    openReader();
  }));
}

function pageMarkup(page) {
  return `<section class="comic-page" id="page-${page.global}" data-global="${page.global}" data-chapter="${page.chapterIndex}" aria-label="Trang ${page.global}: ${escapeHTML(page.title)}">
    <img class="page-art" src="${escapeHTML(page.image)}" alt="${escapeHTML(page.alt || page.title)}" loading="${page.global <= 2 ? 'eager' : 'lazy'}" decoding="async">
  </section>`;
}

function renderReader() {
  comic.innerHTML = publishedPages.map(pageMarkup).join('');
  overlay.dataset.mode = mode;
  document.querySelector('#readerMode').textContent = mode === 'vertical' ? 'Lật trang' : 'Đọc dọc';
  bottomBar.hidden = mode === 'vertical';
  chapterEnd.hidden = mode === 'paged';
  observePages();
  showCurrentPage(false);
}

function saveProgress(global) {
  const page = pageByGlobal.get(global);
  if (!page) return;
  currentGlobal = global;
  localStorage.setItem('ctp-progress', global);
  localStorage.setItem('ctp-chapter', page.chapterIndex);
  positionLabel.textContent = `Trang ${global} / ${publishedThrough}`;
  chapterTitle.textContent = `Chương ${page.chapterIndex + 1} · ${page.chapterShort}`;
  pageCounter.textContent = `${global} / ${publishedThrough}`;
  progressBar.style.width = `${(global / publishedThrough) * 100}%`;
  document.querySelector('#readButtonLabel').textContent = global > 1 ? `Đọc tiếp · Trang ${global}` : 'Đọc ngay';
  preloadAround(global);
}

function observePages() {
  observer?.disconnect();
  if (mode !== 'vertical') return;
  observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) saveProgress(Number(visible.target.dataset.global));
  }, {root: viewport, threshold: [.35, .6, .85]});
  comic.querySelectorAll('.comic-page').forEach(page => observer.observe(page));
}

function showCurrentPage(smooth = true) {
  const page = pageByGlobal.get(currentGlobal) || publishedPages[0];
  if (!page) return;
  currentGlobal = page.global;
  comic.querySelectorAll('.comic-page').forEach(element => element.classList.toggle('active-page', Number(element.dataset.global) === currentGlobal));
  saveProgress(currentGlobal);
  if (mode === 'vertical') {
    document.querySelector(`#page-${currentGlobal}`)?.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'start'});
  } else {
    viewport.scrollTop = 0;
  }
}

function stepPage(direction) {
  const next = currentGlobal + direction;
  if (!pageByGlobal.has(next)) {
    if (direction > 0) chapterEnd.hidden = false;
    return;
  }
  currentGlobal = next;
  showCurrentPage(false);
  showControls();
}

function preloadAround(global) {
  [global + 1, global + 2, global - 1].forEach(number => {
    const page = pageByGlobal.get(number);
    if (page && !document.head.querySelector(`link[data-preload-page="${number}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = page.image;
      link.dataset.preloadPage = number;
      document.head.appendChild(link);
    }
  });
}

async function requestReaderFullscreen() {
  const request = overlay.requestFullscreen || overlay.webkitRequestFullscreen;
  if (!request) return;
  try {
    requestedFullscreen = true;
    await request.call(overlay, {navigationUI: 'hide'});
  } catch (_) {
    requestedFullscreen = false;
  }
}

async function openReader() {
  if (!publishedPages.length) return;
  readerIsOpen = true;
  overlay.hidden = false;
  document.body.classList.add('reader-open');
  renderReader();
  await requestReaderFullscreen();
  requestAnimationFrame(() => showCurrentPage(false));
  showControls();
  viewport.focus({preventScroll: true});
}

async function closeReader({fromFullscreen = false} = {}) {
  if (!readerIsOpen) return;
  readerIsOpen = false;
  closeDrawer();
  if (!fromFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
    try { await (document.exitFullscreen?.() || document.webkitExitFullscreen?.()); } catch (_) {}
  }
  overlay.hidden = true;
  document.body.classList.remove('reader-open');
  clearTimeout(controlsTimer);
}

function setMode(nextMode) {
  mode = nextMode;
  localStorage.setItem('ctp-reader-mode', mode);
  renderReader();
  showControls();
}

function showControls() {
  overlay.classList.remove('controls-hidden');
  clearTimeout(controlsTimer);
  controlsTimer = window.setTimeout(() => {
    if (!drawer.classList.contains('open')) overlay.classList.add('controls-hidden');
  }, 2800);
}

function toggleControls(event) {
  if (event.target.closest('button, a')) return;
  overlay.classList.toggle('controls-hidden');
  if (!overlay.classList.contains('controls-hidden')) showControls();
}

function openDrawer() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  scrim.hidden = false;
  overlay.classList.remove('controls-hidden');
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  scrim.hidden = true;
}

document.querySelector('#readButton').addEventListener('click', openReader);
document.querySelector('#chaptersButton').addEventListener('click', () => document.querySelector('#episodes').scrollIntoView({behavior: 'smooth'}));
document.querySelector('#exitReader').addEventListener('click', () => closeReader());
document.querySelector('#backToSeries').addEventListener('click', () => closeReader());
document.querySelector('#readerMode').addEventListener('click', () => setMode(mode === 'vertical' ? 'paged' : 'vertical'));
document.querySelector('#readerContents').addEventListener('click', openDrawer);
document.querySelector('#closeDrawer').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
document.querySelector('#prevPage').addEventListener('click', () => stepPage(-1));
document.querySelector('#nextPage').addEventListener('click', () => stepPage(1));
viewport.addEventListener('click', toggleControls);
viewport.addEventListener('pointermove', showControls, {passive: true});
viewport.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, {passive: true});
viewport.addEventListener('touchend', event => {
  if (mode !== 'paged') return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) stepPage(dx < 0 ? 1 : -1);
}, {passive: true});
document.addEventListener('keydown', event => {
  if (!readerIsOpen) return;
  if (event.key === 'Escape') closeReader();
  if (event.key === 'ArrowRight' || event.key === 'PageDown') stepPage(1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') stepPage(-1);
  if (event.key.toLowerCase() === 'm') setMode(mode === 'vertical' ? 'paged' : 'vertical');
});
document.addEventListener('fullscreenchange', () => {
  if (requestedFullscreen && !document.fullscreenElement && readerIsOpen) {
    requestedFullscreen = false;
    closeReader({fromFullscreen: true});
  }
});
document.addEventListener('webkitfullscreenchange', () => {
  if (requestedFullscreen && !document.webkitFullscreenElement && readerIsOpen) {
    requestedFullscreen = false;
    closeReader({fromFullscreen: true});
  }
});

buildPublicChapterList();
saveProgress(currentGlobal);
