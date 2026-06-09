(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope || (!input && !year && !region && !type)) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }
        function apply() {
            var keyword = valueOf(input);
            var yearValue = valueOf(year);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            cards.forEach(function (card) {
                var search = card.getAttribute("data-search") || "";
                var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                var matched = true;
                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }
                card.hidden = !matched;
            });
        }
        [input, year, region, type].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var url = video.getAttribute("data-hls");
            var started = false;
            function playVideo() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }
            function start() {
                if (!url) {
                    return;
                }
                box.classList.add("is-playing");
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    return;
                }
                video.src = url;
                video.load();
                playVideo();
            }
            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                    return;
                }
                if (video.paused) {
                    playVideo();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
