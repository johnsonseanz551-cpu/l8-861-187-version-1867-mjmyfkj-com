(function () {
  var hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function playVideo(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play-button]');

    if (!video || box.getAttribute('data-ready') === 'true') {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }

    var streamUrl = video.getAttribute('data-stream');

    if (!streamUrl) {
      return;
    }

    function reveal() {
      box.setAttribute('data-ready', 'true');
      video.controls = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function start() {
      reveal();
      video.play().catch(function () {});
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      start();
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, start);
      } else {
        video.src = streamUrl;
        start();
      }
    }).catch(function () {
      video.src = streamUrl;
      start();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var cover = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        playVideo(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        playVideo(box);
      });
    }
  });
})();
