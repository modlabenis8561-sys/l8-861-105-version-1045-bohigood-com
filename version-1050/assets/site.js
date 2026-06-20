(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".movie-card__image, .rank-card__image, .hero-poster, .detail-poster");
        if (holder) {
          holder.classList.add("image-fallback");
        }
      });
    });
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute("data-stream");
    var overlay = document.querySelector("[data-play-button]");
    var isReady = false;
    var hlsInstance = null;

    function attachStream() {
      if (isReady || !streamUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      isReady = true;
    }

    function playVideo() {
      attachStream();
      video.setAttribute("controls", "controls");
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-card__image\" href=\"./" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"movie-card__play\">▶</span>",
      "  </a>",
      "  <div class=\"movie-card__body\">",
      "    <div class=\"movie-card__meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    if (!query.trim()) {
      return;
    }
    var keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var found = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
      return keywords.every(function (keyword) {
        return text.indexOf(keyword) !== -1;
      });
    }).slice(0, 120);
    if (title) {
      title.textContent = "“" + query.trim() + "” 的搜索结果";
    }
    if (found.length) {
      results.innerHTML = found.map(renderSearchCard).join("");
    } else {
      results.innerHTML = "<div class=\"content-card\"><h2>没有找到完全匹配的内容</h2><p>可以尝试输入影片名、地区、年份或类型中的部分关键词。</p></div>";
    }
    initImages();
  }

  ready(function () {
    initMenu();
    initHero();
    initImages();
    initPlayer();
    initSearchPage();
  });
})();
