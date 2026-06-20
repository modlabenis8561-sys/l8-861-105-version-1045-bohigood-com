(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")));
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

        scopes.forEach(function (scope) {
            var pageScope = scope.parentElement || document;
            var cards = Array.prototype.slice.call(pageScope.querySelectorAll("[data-movie-card]"));
            var keyword = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var category = scope.querySelector("[data-filter-category]");
            var count = scope.querySelector("[data-filter-count]");
            var params = new URLSearchParams(window.location.search);
            var incoming = params.get("q") || "";

            if (keyword && incoming) {
                keyword.value = incoming;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function update() {
                var q = normalize(keyword && keyword.value);
                var selectedRegion = region ? region.value : "";
                var selectedYear = year ? year.value : "";
                var selectedCategory = category ? category.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title"));
                    var matchesKeyword = !q || text.indexOf(q) !== -1;
                    var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                    var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchesCategory = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
                    var isVisible = matchesKeyword && matchesRegion && matchesYear && matchesCategory;

                    card.classList.toggle("is-hidden", !isVisible);
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部";
                }
            }

            [keyword, region, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", update);
                    control.addEventListener("change", update);
                }
            });

            update();
        });
    }

    ready(function () {
        initMobileNavigation();
        initHeroSlider();
        initFilters();
    });
})();
