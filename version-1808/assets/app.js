import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileNav() {
  const button = $('[data-menu-button]');
  const nav = $('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHero() {
  const root = $('[data-hero]');
  if (!root) {
    return;
  }

  const slides = $$('[data-hero-slide]', root);
  const dots = $$('[data-hero-dot]', root);
  const prev = $('[data-hero-prev]', root);
  const next = $('[data-hero-next]', root);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot));
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function resolvePath(url, prefix) {
  if (!url) {
    return '#';
  }

  if (prefix === '../') {
    return `../${url}`;
  }

  return url;
}

function setupSearch() {
  const form = $('[data-site-search-form]');
  const input = $('[data-site-search-input]');
  const results = $('[data-site-search-results]');
  const items = globalThis.SITE_SEARCH_ITEMS || [];

  if (!form || !input || !results || !items.length) {
    return;
  }

  const prefix = results.dataset.detailPrefix || './';

  const render = (keyword) => {
    const value = keyword.trim().toLowerCase();
    if (!value) {
      results.innerHTML = '';
      return;
    }

    const matched = items.filter((item) => {
      return [item.title, item.year, item.region, item.type, item.genre, item.category, item.text]
        .join(' ')
        .toLowerCase()
        .includes(value);
    }).slice(0, 16);

    if (!matched.length) {
      results.innerHTML = '<p>没有找到匹配影片。</p>';
      return;
    }

    results.innerHTML = matched.map((item) => `
      <a class="search-result-item" href="${resolvePath(item.url, prefix)}">
        <img src="${resolvePath(item.cover, prefix)}" alt="${item.title} 搜索封面" loading="lazy">
        <span>
          <strong>${item.title}</strong><br>
          <small>${item.year} · ${item.region} · ${item.type} · ${item.category}</small>
        </span>
      </a>
    `).join('');
  };

  input.addEventListener('input', () => render(input.value));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render(input.value);
  });
}

function setupPlayers() {
  const buttons = $$('.js-play');

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const card = button.closest('.player-card');
      const video = card ? $('.movie-player', card) : null;
      const url = button.dataset.videoUrl || (video ? video.dataset.videoUrl : '');

      if (!video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (Hls && Hls.isSupported()) {
        if (!video.hlsInstance) {
          video.hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          video.hlsInstance.attachMedia(video);
        }
        video.hlsInstance.loadSource(url);
      } else {
        video.src = url;
      }

      card.classList.add('is-playing');
      try {
        await video.play();
      } catch (error) {
        card.classList.remove('is-playing');
      }
    });
  });
}

setupMobileNav();
setupHero();
setupSearch();
setupPlayers();
