(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
      menuButton.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var previous = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5600);
      }

      if (previous) {
        previous.addEventListener('click', function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      showSlide(0);
      restart();
    }

    var searchInput = document.querySelector('[data-filter-search]');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && cardList) {
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

      function filterCards() {
        var query = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();

          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';

          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('show', visible === 0);
        }
      }

      searchInput.addEventListener('input', filterCards);
      filterCards();
    }

    var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    playerBlocks.forEach(function (block) {
      var video = block.querySelector('video');
      var playButton = block.querySelector('[data-play]');

      function startVideo() {
        if (!video) {
          return;
        }

        var stream = video.getAttribute('data-stream');

        if (!stream) {
          return;
        }

        if (video.getAttribute('data-ready') !== 'true') {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video.hlsController = hls;
          } else {
            video.src = stream;
          }

          video.setAttribute('data-ready', 'true');
        }

        block.classList.add('player-active');

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (playButton) {
        playButton.addEventListener('click', startVideo);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startVideo();
          }
        });

        video.addEventListener('play', function () {
          block.classList.add('player-active');
        });
      }
    });
  });
}());
