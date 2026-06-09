(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('.hero');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }

    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.querySelector('.no-results');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var searchForms = Array.prototype.slice.call(document.querySelectorAll('.search-form'));
  var activeFilter = 'all';
  var activeQuery = new URLSearchParams(window.location.search).get('q') || '';

  function cardMatches(card) {
    var haystack = card.getAttribute('data-search') || '';
    var filterText = activeFilter.toLowerCase();
    var queryText = activeQuery.trim().toLowerCase();
    var filterMatch = activeFilter === 'all' || haystack.indexOf(filterText) !== -1;
    var queryMatch = !queryText || haystack.indexOf(queryText) !== -1;

    return filterMatch && queryMatch;
  }

  function applyMovieFilters() {
    if (!cards.length) {
      return;
    }

    var shown = 0;

    cards.forEach(function(card) {
      var match = cardMatches(card);
      card.hidden = !match;
      if (match) {
        shown += 1;
      }
    });

    if (noResults) {
      noResults.hidden = shown !== 0;
    }
  }

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeFilter = button.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });

      applyMovieFilters();
    });
  });

  searchForms.forEach(function(form) {
    var input = form.querySelector('input[name="q"]');

    if (input && activeQuery && cards.length) {
      input.value = activeQuery;
    }

    form.addEventListener('submit', function(event) {
      if (!input) {
        return;
      }

      var value = input.value.trim();

      if (cards.length) {
        event.preventDefault();
        activeQuery = value;
        applyMovieFilters();
        return;
      }

      if (!value) {
        event.preventDefault();
      }
    });
  });

  if (filterButtons.length) {
    filterButtons[0].classList.add('is-active');
  }

  applyMovieFilters();

  var video = document.getElementById('movie-player');
  var cover = document.querySelector('.player-cover');

  if (video && cover) {
    var hlsUrl = video.getAttribute('data-hls') || '';
    var loaded = false;
    var hlsInstance = null;
    var message = null;

    function showMessage(text) {
      if (!message) {
        message = document.createElement('div');
        message.className = 'player-message';
        video.parentNode.appendChild(message);
      }

      message.textContent = text;
    }

    function playMedia() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          showMessage('播放暂不可用，稍后再试。');
        });
      }
    }

    function loadMedia() {
      if (loaded || !hlsUrl) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          playMedia();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            showMessage('播放暂不可用，稍后再试。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', playMedia, { once: true });
        return;
      }

      showMessage('播放暂不可用，稍后再试。');
    }

    function startPlayback() {
      cover.classList.add('is-hidden');

      if (!loaded) {
        loadMedia();
        return;
      }

      if (video.paused) {
        playMedia();
      }
    }

    cover.addEventListener('click', startPlayback);

    video.addEventListener('click', function() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
