(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".header-search"));
    var data = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    forms.forEach(function (form) {
      var input = form.querySelector(".global-search-input");
      var panel = form.querySelector(".search-panel");
      if (!input || !panel) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("open");
          panel.innerHTML = "";
          return;
        }
        var results = data.filter(function (item) {
          return String(item.text || "").toLowerCase().indexOf(query) !== -1;
        }).slice(0, 12);
        if (!results.length) {
          panel.innerHTML = "<div class=\"search-empty\">没有找到匹配影片</div>";
          panel.classList.add("open");
          return;
        }
        panel.innerHTML = results.map(function (item) {
          return "<a class=\"search-result\" href=\"" + item.url + "\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\" onerror=\"this.style.display='none'\">" +
            "<span><strong class=\"search-title\">" + item.title + "</strong>" +
            "<small class=\"search-meta\">" + item.year + " · " + item.category + " · " + item.genre + "</small></span>" +
            "</a>";
        }).join("");
        panel.classList.add("open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    });
  }

  function setupPlayer() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    blocks.forEach(function (block) {
      var video = block.querySelector("video");
      var button = block.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;

      function attach() {
        if (!stream || attached) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      }

      function play() {
        attach();
        block.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        block.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
