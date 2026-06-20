(function () {
  function initializePlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-player-overlay]");
    var button = shell.querySelector("[data-play-button]");
    var url = video ? video.getAttribute("data-video") : "";
    var prepared = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          attemptPlay();
        });
        return;
      }

      video.src = url;
    }

    function attemptPlay() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      prepare();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      attemptPlay();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start(event);
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  document.querySelectorAll("[data-player-shell]").forEach(initializePlayer);
}());
