const comic = document.querySelector('#comic');
const chapterNav = document.querySelector('#chapterNav');
const drawerChapters = document.querySelector('#drawerChapters');
const drawer = document.querySelector('#drawer');
const scrim = document.querySelector('#scrim');
const modeButton = document.querySelector('#modeButton');
const progressBar = document.querySelector('#progressBar');
const progressText = document.querySelector('#progressText');
const pageControls = document.querySelector('#pageControls');
const pageCounter = document.querySelector('#pageCounter');

const savedChapter = Number(localStorage.getItem('ctp-chapter') || 0);
let chapterIndex = Number.isInteger(savedChapter)
  ? Math.min(Math.max(savedChapter, 0), STORY.chapters.length - 1)
  : 0;
let pageIndex = 0;
let mode = ['vertical', 'paged'].includes(localStorage.getItem('ctp-mode'))
  ? localStorage.getItem('ctp-mode')
  : 'vertical';

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function imageFor(page) {
  if (!page.image) return '';
  return `<img class="page-art" loading="lazy" src="${escapeHTML(page.image)}" alt="${escapeHTML(page.alt || page.title)}" onerror="this.classList.add('is-missing')">`;
}

function renderChapter() {
  const chapter = STORY.chapters[chapterIndex];
  pageIndex = 0;
  localStorage.setItem('ctp-chapter', chapterIndex);
  document.title = `${chapter.title} — Cửu Tầng Phẳng`;
  progressText.textContent = `Chương ${chapterIndex + 1} / ${STORY.chapters.length}`;
  progressBar.style.width = `${((chapterIndex + 1) / STORY.chapters.length) * 100}%`;

  comic.innerHTML = `
    <header class="chapter-opening active-page">
      <p class="section-kicker">CHƯƠNG ${chapterIndex + 1}</p>
      <h3>${escapeHTML(chapter.title)}</h3>
      <p>${escapeHTML(chapter.opening)}</p>
    </header>
    ${chapter.pages.map((page, index) => `
      <section class="comic-page" data-page="${index + 1}">
        ${imageFor(page)}
        <div class="page-copy">
          <span class="page-number">TRANG ${String(page.global).padStart(2, '0')}</span>
          <h4 class="page-title">${escapeHTML(page.title)}</h4>
          <p class="narration">${escapeHTML(page.narration)}</p>
          <div class="dialogue">
            ${page.lines.map(line => `<p class="line"><strong>${escapeHTML(line[0])}:</strong> ${escapeHTML(line[1])}</p>`).join('')}
          </div>
        </div>
      </section>`).join('')}`;
  updatePagedView();
  updateChapterButtons();
}

function updateChapterButtons() {
  [...document.querySelectorAll('[data-chapter]')].forEach(button => button.classList.toggle('active', Number(button.dataset.chapter) === chapterIndex));
}

function buildChapterNav() {
  const buttons = STORY.chapters.map((chapter, index) => `<button type="button" data-chapter="${index}">${index + 1}. ${escapeHTML(chapter.short)}</button>`).join('');
  chapterNav.innerHTML = buttons;
  drawerChapters.innerHTML = STORY.chapters.map((chapter, index) => `<button type="button" data-chapter="${index}"><strong>Chương ${index + 1}</strong><br>${escapeHTML(chapter.title)}</button>`).join('');
  document.querySelectorAll('[data-chapter]').forEach(button => button.addEventListener('click', () => {
    chapterIndex = Number(button.dataset.chapter);
    renderChapter();
    closeDrawer();
    document.querySelector('#reader').scrollIntoView({behavior: 'smooth'});
  }));
}

function setMode(nextMode) {
  mode = nextMode;
  document.body.dataset.mode = mode;
  localStorage.setItem('ctp-mode', mode);
  modeButton.textContent = mode === 'vertical' ? 'Lật trang' : 'Đọc dọc';
  pageControls.hidden = mode === 'vertical';
  pageIndex = 0;
  updatePagedView();
}

function updatePagedView() {
  const pages = [...comic.children];
  if (!pages.length) return;
  pageIndex = Math.min(Math.max(pageIndex, 0), pages.length - 1);
  pages.forEach((page, index) => page.classList.toggle('active-page', index === pageIndex));
  pageCounter.textContent = `${pageIndex + 1} / ${pages.length}`;
  document.querySelector('#prevPage').disabled = pageIndex === 0;
  document.querySelector('#nextPage').disabled = pageIndex === pages.length - 1;
}

function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.hidden = false; }
function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.hidden = true; }

document.querySelector('#readButton').addEventListener('click', () => document.querySelector('#reader').scrollIntoView({behavior: 'smooth'}));
document.querySelector('#aboutButton').addEventListener('click', () => document.querySelector('#about').scrollIntoView({behavior: 'smooth'}));
document.querySelector('#contentsButton').addEventListener('click', openDrawer);
document.querySelector('#closeDrawer').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
modeButton.addEventListener('click', () => setMode(mode === 'vertical' ? 'paged' : 'vertical'));
document.querySelector('#prevPage').addEventListener('click', () => { pageIndex -= 1; updatePagedView(); });
document.querySelector('#nextPage').addEventListener('click', () => { pageIndex += 1; updatePagedView(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDrawer();
  if (mode === 'paged' && event.key === 'ArrowRight') { pageIndex += 1; updatePagedView(); }
  if (mode === 'paged' && event.key === 'ArrowLeft') { pageIndex -= 1; updatePagedView(); }
});

buildChapterNav();
renderChapter();
setMode(mode);
