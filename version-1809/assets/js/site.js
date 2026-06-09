(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (form.classList.contains('keep-local')) {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const value = input ? input.value.trim() : '';
        const url = new URL(window.location.href);
        if (value) {
          url.searchParams.set('q', value);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState(null, '', url.toString());
        runFilter(value);
        return;
      }
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter(keyword) {
    const query = normalize(keyword);
    document.querySelectorAll('[data-filter-grid]').forEach(function (grid) {
      grid.querySelectorAll('[data-search]').forEach(function (item) {
        const text = normalize(item.getAttribute('data-search'));
        item.classList.toggle('is-filtered-out', Boolean(query) && !text.includes(query));
      });
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  document.querySelectorAll('.filter-input').forEach(function (input) {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
    input.addEventListener('input', function () {
      runFilter(input.value);
    });
  });
  if (initialQuery) {
    runFilter(initialQuery);
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    let active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        const isActive = slideIndex === active;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(active + 1);
    }, 5600);
  });
}());
