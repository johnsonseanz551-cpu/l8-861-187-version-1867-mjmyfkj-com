(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector("[data-movie-video]");
        if (!video) {
            return;
        }

        var source = video.getAttribute("data-video-src");
        var button = document.querySelector("[data-play-button]");
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached || !source) {
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        attachSource();

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
