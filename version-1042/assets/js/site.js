(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  if (slides.length > 0) {
    var current = 0;
    var setSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });
    setInterval(function () {
      setSlide(current + 1);
    }, 5200);
    setSlide(0);
  }

  var filterBlocks = qsa('[data-filter-scope]');
  filterBlocks.forEach(function (scope) {
    var input = qs('[data-filter-input]', scope);
    var year = qs('[data-filter-year]', scope);
    var region = qs('[data-filter-region]', scope);
    var cards = qsa('[data-movie-card]', scope);
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear && matchRegion));
      });
    };
    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });
})();

function initHlsPlayer(videoId, coverId, source) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !source) {
    return;
  }
  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlay() {
    attachSource();
    video.controls = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playTask = video.play();
    if (playTask && playTask.catch) {
      playTask.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlay);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    } else {
      video.pause();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
