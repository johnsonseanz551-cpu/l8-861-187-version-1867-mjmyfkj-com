(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('open');
      var input = searchPanel.querySelector('[data-search-input]');
      if (searchPanel.classList.contains('open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function applySearch(value) {
    var query = (value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var text = card.textContent.toLowerCase() + ' ' + [
        card.getAttribute('data-title'),
        card.getAttribute('data-kind'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();
      var ok = !query || text.indexOf(query) !== -1;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        shown += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', shown === 0 && cards.length > 0);
    }
  }

  forms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      applySearch(input.value);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (cards.length) {
        applySearch(input.value);
      } else if (input.value.trim()) {
        var base = form.getAttribute('data-search-target') || 'library.html';
        window.location.href = base + '?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var urlQuery = new URLSearchParams(window.location.search).get('q');
  if (urlQuery) {
    var firstInput = document.querySelector('[data-search-input]');
    if (firstInput) {
      firstInput.value = urlQuery;
    }
    applySearch(urlQuery);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter-button');
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      cards.forEach(function (card) {
        var ok = filter === 'all' || card.getAttribute('data-kind') === filter;
        card.style.display = ok ? '' : 'none';
      });
    });
  });
})();
