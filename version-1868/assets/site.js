(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var localInput = document.querySelector('[data-local-filter]');
  var localGrid = document.querySelector('[data-filter-grid]');

  if (localInput && localGrid) {
    var localCards = Array.prototype.slice.call(localGrid.querySelectorAll('[data-movie-card]'));

    localInput.addEventListener('input', function () {
      var keyword = localInput.value.trim().toLowerCase();

      localCards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        card.classList.toggle('is-filtered-out', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchPage.querySelector('[data-search-input]');
    var filterFields = Array.prototype.slice.call(searchPage.querySelectorAll('[data-filter]'));
    var searchCards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-movie-card]'));

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    filterFields.forEach(function (field) {
      var key = field.getAttribute('data-filter');
      var value = params.get(key);

      if (value) {
        field.value = value;
      }
    });

    function applySearch() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var filters = {};

      filterFields.forEach(function (field) {
        filters[field.getAttribute('data-filter')] = field.value;
      });

      searchCards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || card.getAttribute('data-' + key) === filters[key];
        });

        card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedFilters));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applySearch);
    }

    filterFields.forEach(function (field) {
      field.addEventListener('change', applySearch);
    });

    applySearch();
  }
})();
