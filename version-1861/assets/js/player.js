(function () {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-video') || '';
  var prepared = false;
  var hls = null;

  function preparePlayer() {
    if (prepared || !stream) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
    }
  }

  function beginPlayback() {
    preparePlayer();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', beginPlayback);
  }

  if (cover) {
    cover.addEventListener('click', beginPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
