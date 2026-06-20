(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '" class="card-link">',
      '<div class="card-cover">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-category">' + escapeHtml(movie.category) + '</span>',
      '<span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(" · ")) + '</span>',
      '<span>★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function runSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    if (!query) {
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [
        movie.title,
        movie.description,
        movie.category,
        movie.genre,
        movie.region,
        movie.type,
        movie.year,
        movie.tags
      ].join(" ").toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (subtitle) {
      subtitle.textContent = "关键词：“" + params.get("q") + "”";
    }
    results.innerHTML = matched.map(cardHtml).join("");
  }

  ready(function () {
    initSearchForms();
    initMobileMenu();
    initHero();
    runSearchPage();
  });
})();
