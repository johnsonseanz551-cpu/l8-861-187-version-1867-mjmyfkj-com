(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-query]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!filterItems.length) {
      return;
    }

    var query = normalize(filterInput && filterInput.value);
    var type = normalize(filterType && filterType.value);
    var region = normalize(filterRegion && filterRegion.value);
    var year = normalize(filterYear && filterYear.value);
    var visible = 0;

    filterItems.forEach(function (item) {
      var haystack = normalize(item.getAttribute('data-title') + ' ' + item.getAttribute('data-tags') + ' ' + item.getAttribute('data-genre'));
      var itemType = normalize(item.getAttribute('data-type'));
      var itemRegion = normalize(item.getAttribute('data-region'));
      var itemYear = normalize(item.getAttribute('data-year'));
      var keep = true;

      if (query && haystack.indexOf(query) === -1) {
        keep = false;
      }

      if (type && itemType.indexOf(type) === -1) {
        keep = false;
      }

      if (region && itemRegion.indexOf(region) === -1) {
        keep = false;
      }

      if (year && itemYear !== year) {
        keep = false;
      }

      item.style.display = keep ? '' : 'none';

      if (keep) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial) {
      filterInput.value = initial;
    }

    [filterInput, filterType, filterRegion, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }
})();
