(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-url") || "search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    if (filterInput) {
      filterInput.addEventListener("input", function () {
        var value = filterInput.value.trim().toLowerCase();
        document.querySelectorAll("[data-title]").forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || ""
          ].join(" ").toLowerCase();
          card.hidden = value && haystack.indexOf(value) === -1;
        });
      });
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && Array.isArray(window.SEARCH_DATA)) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var searchInput = document.querySelector("[data-search-page-input]");
      if (searchInput) {
        searchInput.value = query;
      }
      renderSearch(searchRoot, query);
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function renderSearch(root, query) {
    if (!query) {
      root.innerHTML = "<div class=\"empty-state\">请输入片名、类型、地区或年份进行搜索。</div>";
      return;
    }

    var lower = query.toLowerCase();
    var results = window.SEARCH_DATA.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);

    if (!results.length) {
      root.innerHTML = "<div class=\"empty-state\">暂未找到匹配内容，换个关键词试试。</div>";
      return;
    }

    root.innerHTML = results.map(function (item) {
      return [
        "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\">",
        "  <a href=\"" + escapeHtml(item.href) + "\">",
        "    <div class=\"card-cover\">",
        "      <img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\">",
        "      <span class=\"card-year\">" + escapeHtml(item.year) + "</span>",
        "    </div>",
        "    <div class=\"card-body\">",
        "      <h2>" + escapeHtml(item.title) + "</h2>",
        "      <p>" + escapeHtml(item.oneLine) + "</p>",
        "      <div class=\"card-meta\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
        "    </div>",
        "  </a>",
        "</article>"
      ].join("");
    }).join("");
  }
}());
