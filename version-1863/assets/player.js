(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-button]');
    var stream = shell.getAttribute('data-stream-url');
    var started = false;

    function attachStream() {
      if (!video || !stream || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        shell._hls = hls;
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      shell.classList.add('is-playing');
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      if (!started) {
        startPlayback();
      }
    });
  });
})();
