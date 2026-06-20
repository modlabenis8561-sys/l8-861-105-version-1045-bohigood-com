(function () {
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function snippet(value, length) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > length ? text.slice(0, length) + "…" : text;
  }

  function card(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.detail) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<img src=\"./" + movie.image + ".jpg\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.style.display='none'; this.parentElement.classList.add('image-missing');\">",
      "<span class=\"play-mark\">▶</span>",
      "<span class=\"movie-category\">" + escapeHtml(movie.category) + "</span>",
      "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
      "</a>",
      "<div class=\"movie-body\">",
      "<h3><a href=\"" + escapeHtml(movie.detail) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(snippet(movie.one_line || movie.summary, 80)) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "<div class=\"movie-stats\"><span>★ " + movie.rating + "</span><span>" + Number(movie.views).toLocaleString() + " 次观看</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function searchable(movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      movie.tags,
      movie.one_line,
      movie.summary
    ].join(" ").toLowerCase();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("searchInput");
    var button = document.getElementById("searchButton");
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var count = document.getElementById("searchCount");
    var movies = window.MOVIES || [];
    var initial = qs("q");

    if (input) {
      input.value = initial;
    }

    function render(value) {
      var query = String(value || "").trim().toLowerCase();
      var matched = movies.filter(function (movie) {
        return !query || searchable(movie).indexOf(query) !== -1;
      }).slice(0, 240);

      if (results) {
        results.innerHTML = matched.map(card).join("");
      }
      if (title) {
        title.textContent = query ? "搜索结果：" + value : "热门搜索推荐";
      }
      if (count) {
        count.textContent = matched.length + " 条结果";
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        render(input ? input.value : "");
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          render(input.value);
        }
      });
    }

    document.querySelectorAll("[data-search-filter]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var value = tab.getAttribute("data-search-filter") || "";
        if (input) {
          input.value = value;
        }
        render(value);
      });
    });

    render(initial);
  });
}());
