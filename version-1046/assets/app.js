(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "×" : "☰";
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "search.html";
        if (value) {
          window.location.href = target + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panelElement) {
      var section = panelElement.parentElement;
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];
      var keyword = panelElement.querySelector("[data-filter-keyword]");
      var type = panelElement.querySelector("[data-filter-type]");
      var region = panelElement.querySelector("[data-filter-region]");
      var year = panelElement.querySelector("[data-filter-year]");
      var count = panelElement.querySelector("[data-filter-count]");

      function cardText(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
      }

      function apply() {
        var kw = keyword ? keyword.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var ok = true;

          if (kw && text.indexOf(kw) === -1) {
            ok = false;
          }
          if (typeValue && text.indexOf(typeValue.toLowerCase()) === -1) {
            ok = false;
          }
          if (regionValue && text.indexOf(regionValue.toLowerCase()) === -1) {
            ok = false;
          }
          if (yearValue && text.indexOf(yearValue.toLowerCase()) === -1) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
        }
      }

      [keyword, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
}());
