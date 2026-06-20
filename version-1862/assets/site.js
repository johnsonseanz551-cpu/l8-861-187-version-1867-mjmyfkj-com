(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initImages(root) {
    selectAll('[data-cover-img]', root).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      });
    });
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function initBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 420);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video[data-src]');
      var button = box.querySelector('[data-player-start]');
      var started = false;
      var hls = null;
      if (!video || !button) {
        return;
      }
      function start() {
        if (started) {
          video.play();
          return;
        }
        started = true;
        box.classList.add('is-playing');
        var source = video.getAttribute('data-src');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    var form = document.querySelector('[data-search-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var status = document.querySelector('[data-search-status]');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!page || !form || !input || !results || !data.length) {
      return;
    }
    function makeCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
        '<figure class="movie-cover">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="cover-image" loading="lazy" data-cover-img>' +
          '<span class="movie-type">' + escapeHtml(item.type) + '</span>' +
          '<span class="play-sign">▶</span>' +
        '</figure>' +
        '<div class="movie-card-body">' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.one_line) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.score) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>';
    }
    function perform(query) {
      var q = String(query || '').trim().toLowerCase();
      var list = data;
      if (q) {
        list = data.filter(function (item) {
          return item.search.indexOf(q) !== -1;
        });
      }
      var display = list.slice(0, 80);
      results.innerHTML = display.map(makeCard).join('');
      initImages(results);
      if (title) {
        title.textContent = q ? '搜索结果' : '热门影片';
      }
      if (status) {
        status.textContent = q ? '已根据关键词筛选相关影片。' : '可通过上方搜索框筛选片库内容。';
      }
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    perform(initial);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? window.location.pathname + '?q=' + encodeURIComponent(value) : window.location.pathname;
      window.history.replaceState(null, '', url);
      perform(value);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImages(document);
    initNavigation();
    initHero();
    initBackTop();
    initPlayers();
    initSearchPage();
  });
})();
