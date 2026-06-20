(function () {
    function initPlayer(root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('.player-overlay');
        if (!video || !overlay) return;
        var source = video.getAttribute('data-source');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !source) return;
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function start() {
            prepare();
            overlay.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) hls.destroy();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), initPlayer);
    });
}());
