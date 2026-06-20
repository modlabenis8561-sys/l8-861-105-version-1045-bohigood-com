(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var old = document.querySelector("script[data-hls-loader]");
    if (old) {
      old.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.setAttribute("data-hls-loader", "1");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  window.initVideoPlayer = function(videoId, coverId, buttonId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    if (!video || !cover || !url) {
      return;
    }
    var started = false;
    function start() {
      if (started) {
        video.play();
        return;
      }
      started = true;
      cover.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play();
        return;
      }
      loadHls(function() {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play();
          });
        } else {
          video.src = url;
          video.play();
        }
      });
    }
    cover.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
  };

  ready(function() {
    var menu = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (menu && panel) {
      menu.addEventListener("click", function() {
        panel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var current = 0;
      function show(index) {
        current = index % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }
      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          show(i);
        });
      });
      setInterval(function() {
        show(current + 1);
      }, 5000);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-results .movie-card, .filter-results .rank-row"));
      if (scope.hasAttribute("data-query-sync") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
      }
      function match(card) {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var text = [card.dataset.title, card.dataset.genre, card.dataset.type, card.dataset.year, card.dataset.region, card.dataset.category].join(" ").toLowerCase();
        var okText = !q || text.indexOf(q) !== -1;
        var okYear = !y || card.dataset.year === y;
        var okType = !t || card.dataset.type === t;
        return okText && okYear && okType;
      }
      function apply() {
        cards.forEach(function(card) {
          card.style.display = match(card) ? "" : "none";
        });
      }
      [input, year, type].forEach(function(el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
})();
