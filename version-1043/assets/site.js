(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var mobileToggle = document.querySelector(".mobile-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var currentSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        var pageSearch = document.querySelector(".js-filter-input");
        var genreSelect = document.querySelector(".js-filter-genre");
        var yearSelect = document.querySelector(".js-filter-year");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card, .filter-grid .rank-row"));
        var emptyState = document.querySelector(".empty-state");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(pageSearch ? pageSearch.value : "");
            var genre = normalize(genreSelect ? genreSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.textContent
                ].join(" "));
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var genreMatch = !genre || cardGenre.indexOf(genre) !== -1;
                var yearMatch = !year || cardYear === year;
                var show = keywordMatch && genreMatch && yearMatch;
                card.classList.toggle("is-filter-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery && pageSearch) {
            pageSearch.value = initialQuery;
        }

        [pageSearch, genreSelect, yearSelect].forEach(function (input) {
            if (input) {
                input.addEventListener("input", applyFilters);
                input.addEventListener("change", applyFilters);
            }
        });

        if (cards.length) {
            applyFilters();
        }
    });
}());
