(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('#mainNav');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupBackTop() {
        var button = qs('[data-back-top]');
        if (!button) return;
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 520);
        }, { passive: true });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) return;
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (!slides.length) return;
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });
        if (prev) prev.addEventListener('click', function () { show(current - 1); play(); });
        if (next) next.addEventListener('click', function () { show(current + 1); play(); });
        show(0);
        play();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var keyword = qs('[data-filter-keyword]', panel);
            var year = qs('[data-filter-year]', panel);
            var region = qs('[data-filter-region]', panel);
            var reset = qs('[data-filter-reset]', panel);
            var list = qs('[data-filter-list]');
            var cards = qsa('[data-movie-card]', list || document);

            function apply() {
                var q = normalize(keyword && keyword.value);
                var y = normalize(year && year.value);
                var r = normalize(region && region.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var matchKeyword = !q || text.indexOf(q) !== -1;
                    var matchYear = !y || normalize(card.dataset.year) === y;
                    var matchRegion = !r || normalize(card.dataset.region) === r;
                    card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear && matchRegion));
                });
            }

            [keyword, year, region].forEach(function (input) {
                if (!input) return;
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (keyword) keyword.value = '';
                    if (year) year.value = '';
                    if (region) region.value = '';
                    apply();
                });
            }
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="play-chip">▶ ' + escapeHtml(movie.duration) + '</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<a class="category-chip" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>' +
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.description) + '</p>' +
            '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="tag-list">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var input = qs('#searchInput');
        var results = qs('#searchResults');
        if (!input || !results || !window.SEARCH_MOVIES) return;
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render() {
            var query = normalize(input.value);
            var movies = window.SEARCH_MOVIES;
            var matched = query ? movies.filter(function (movie) {
                return normalize([movie.title, movie.description, movie.region, movie.year, movie.type, movie.genre, (movie.tags || []).join(' ')].join(' ')).indexOf(query) !== -1;
            }) : movies.slice(0, 36);
            results.innerHTML = matched.slice(0, 120).map(movieCard).join('');
        }

        input.addEventListener('input', render);
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupBackTop();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
