(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var backgrounds = Array.prototype.slice.call(document.querySelectorAll('.hero-bg'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        backgrounds.forEach(function (item, i) {
            item.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function () {
                showHero(current + 1);
            }, 5600);
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showHero(i);
            startHero();
        });
    });
    if (prev) {
        prev.addEventListener('click', function () {
            showHero(current - 1);
            startHero();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            showHero(current + 1);
            startHero();
        });
    }
    showHero(0);
    startHero();

    var panel = document.querySelector('.filter-panel');
    if (panel) {
        var input = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var reset = panel.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var noResults = document.querySelector('.no-results');

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !y || card.getAttribute('data-year') === y;
                var okType = !t || card.getAttribute('data-type') === t;
                var ok = okKeyword && okYear && okType;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        if (type) {
            type.addEventListener('change', applyFilter);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                applyFilter();
            });
        }
        applyFilter();
    }
}());

function initPlayer(streamUrl) {
    var video = document.querySelector('.video-player');
    var cover = document.querySelector('.player-cover');
    var startButton = document.querySelector('.player-start');
    var mounted = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function attach() {
        if (mounted) {
            return;
        }
        mounted = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        attach();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    if (startButton) {
        startButton.addEventListener('click', function (event) {
            event.stopPropagation();
            start();
        });
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
