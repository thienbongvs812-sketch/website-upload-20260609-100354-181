(function () {
    const body = document.body;
    const base = body.getAttribute("data-base") || "./";
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prevButton = document.querySelector(".hero-prev");
    const nextButton = document.querySelector(".hero-next");
    let slideIndex = 0;
    let slideTimer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        slideIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
            slide.classList.toggle("is-active", index === slideIndex);
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === slideIndex);
        });
    }

    function startSlides() {
        if (slideTimer) {
            clearInterval(slideTimer);
        }
        if (slides.length > 1) {
            slideTimer = setInterval(function () {
                showSlide(slideIndex + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        startSlides();
        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(slideIndex - 1);
                startSlides();
            });
        }
        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(slideIndex + 1);
                startSlides();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startSlides();
            });
        });
    }

    const regionTabs = Array.from(document.querySelectorAll(".region-tab"));
    const regionPanels = Array.from(document.querySelectorAll(".region-panel"));

    regionTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const target = tab.getAttribute("data-region-tab");
            regionTabs.forEach(function (item) {
                item.classList.toggle("is-active", item === tab);
            });
            regionPanels.forEach(function (panel) {
                panel.classList.toggle("is-active", panel.getAttribute("data-region-panel") === target);
            });
        });
    });

    const filterInput = document.querySelector(".filter-input");
    const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
    const filterCards = Array.from(document.querySelectorAll(".movie-card[data-title]"));
    let activeFilter = "all";

    function applyFilter() {
        const term = filterInput ? filterInput.value.trim().toLowerCase() : "";
        filterCards.forEach(function (card) {
            const text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-year") || ""
            ].join(" ").toLowerCase();
            const matchesTerm = !term || text.indexOf(term) !== -1;
            const matchesTab = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle("hidden-by-filter", !(matchesTerm && matchesTab));
        });
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }

    filterTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            activeFilter = tab.getAttribute("data-filter") || "all";
            filterTabs.forEach(function (item) {
                item.classList.toggle("is-active", item === tab);
            });
            applyFilter();
        });
    });

    const searchInputs = Array.from(document.querySelectorAll(".search-input"));
    const data = Array.isArray(window.siteSearchData) ? window.siteSearchData : [];

    searchInputs.forEach(function (input) {
        const panel = input.parentElement ? input.parentElement.querySelector(".search-panel") : null;
        if (!panel) {
            return;
        }

        function closePanel() {
            panel.classList.remove("is-open");
        }

        function renderResults() {
            const term = input.value.trim().toLowerCase();
            if (!term) {
                panel.innerHTML = "";
                closePanel();
                return;
            }
            const results = data.filter(function (item) {
                return [item.title, item.genre, item.region, item.year].join(" ").toLowerCase().indexOf(term) !== -1;
            }).slice(0, 8);

            if (!results.length) {
                panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
                panel.classList.add("is-open");
                return;
            }

            panel.innerHTML = results.map(function (item) {
                return '<a class="search-result" href="' + base + item.href + '">' +
                    '<img src="' + base + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</span></span>' +
                    '</a>';
            }).join("");
            panel.classList.add("is-open");
        }

        input.addEventListener("input", renderResults);
        input.addEventListener("focus", renderResults);
        document.addEventListener("click", function (event) {
            if (!input.parentElement.contains(event.target)) {
                closePanel();
            }
        });
    });

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
