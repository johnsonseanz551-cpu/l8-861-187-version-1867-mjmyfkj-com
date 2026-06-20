(function () {
    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        if (!video || !options.url) {
            return;
        }
        var hls = null;
        var attached = false;
        var begin = function () {
            if (button) {
                button.classList.add("is-hidden");
            }
            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                    video.src = options.url;
                    attached = true;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(options.url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal || !hls) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            hls = null;
                            attached = false;
                        }
                    });
                    attached = true;
                }
            } else {
                video.play().catch(function () {});
            }
        };
        if (button) {
            button.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (!attached) {
                begin();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
