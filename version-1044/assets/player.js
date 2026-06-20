(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function formatTime(value) {
    if (!isFinite(value) || value < 0) {
      return "0:00";
    }
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  window.initPlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var overlay = document.getElementById("playerOverlay");
      var toggle = document.getElementById("playerToggle");
      var mute = document.getElementById("playerMute");
      var fullscreen = document.getElementById("playerFullscreen");
      var progress = document.getElementById("playerProgress");
      var time = document.getElementById("playerTime");
      var hls = null;

      if (!video || !streamUrl) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }

      function updateTime() {
        var duration = video.duration || 0;
        var current = video.currentTime || 0;
        if (progress && duration) {
          progress.max = String(Math.floor(duration));
          progress.value = String(Math.floor(current));
        }
        if (time) {
          time.textContent = formatTime(current) + " / " + formatTime(duration);
        }
      }

      function setPlayingState() {
        var playing = !video.paused;
        if (toggle) {
          toggle.textContent = playing ? "暂停" : "▶";
        }
        if (overlay) {
          overlay.classList.toggle("hidden", playing || video.currentTime > 0);
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function togglePlay() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }
      if (toggle) {
        toggle.addEventListener("click", togglePlay);
      }
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", setPlayingState);
      video.addEventListener("pause", setPlayingState);
      video.addEventListener("loadedmetadata", updateTime);
      video.addEventListener("timeupdate", updateTime);
      video.addEventListener("ended", setPlayingState);

      if (mute) {
        mute.addEventListener("click", function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? "静音" : "音量";
        });
      }

      if (fullscreen) {
        fullscreen.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (video.requestFullscreen) {
            video.requestFullscreen();
          }
        });
      }

      if (progress) {
        progress.addEventListener("input", function () {
          video.currentTime = Number(progress.value || 0);
          updateTime();
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });

      updateTime();
      setPlayingState();
    });
  };
})();
