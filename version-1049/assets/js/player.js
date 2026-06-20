(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function parseConfig(root) {
        var data = root.querySelector(".player-json");

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data.textContent || "{}");
        } catch (error) {
            return null;
        }
    }

    function initPlayer(root) {
        var config = parseConfig(root);
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var state = root.querySelector("[data-player-state]");
        var playButton = root.querySelector("[data-player-action='play']");
        var muteButton = root.querySelector("[data-player-action='mute']");
        var fullButton = root.querySelector("[data-player-action='fullscreen']");
        var hlsInstance = null;
        var attached = false;

        if (!config || !config.src || !video) {
            return;
        }

        function setState(text) {
            if (state) {
                state.textContent = text;
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;
            setState("加载中");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(config.src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState("准备播放");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setState("正在重新连接");
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setState("正在恢复播放");
                        hlsInstance.recoverMediaError();
                    } else {
                        setState("播放失败");
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = config.src;
            }
        }

        function play() {
            attachSource();
            video.controls = true;
            root.classList.add("is-playing");
            var result = video.play();

            if (result && typeof result.then === "function") {
                result.then(function () {
                    setState("正在播放");
                }).catch(function () {
                    setState("点击视频继续播放");
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
                setState("已暂停");
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            root.classList.add("is-playing");
            setState("正在播放");
        });
        video.addEventListener("pause", function () {
            setState("已暂停");
        });
        video.addEventListener("waiting", function () {
            setState("缓冲中");
        });
        video.addEventListener("error", function () {
            setState("播放失败");
        });

        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }

        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullButton) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (root.requestFullscreen) {
                    root.requestFullscreen();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(initPlayer);
    });
})();
