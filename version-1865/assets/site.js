(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[type='search'], input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    stop();
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterRoot = document.querySelector("[data-filter-root]");
        if (filterRoot) {
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
            var keywordInput = document.querySelector("[data-filter-keyword]");
            var yearSelect = document.querySelector("[data-filter-year]");
            var regionSelect = document.querySelector("[data-filter-region]");
            var empty = document.querySelector("[data-empty-result]");

            function normalize(value) {
                return String(value || "").toLowerCase();
            }

            function applyFilter() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = yearSelect && yearSelect.value;
                var region = regionSelect && regionSelect.value;
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.dataset.title + " " + card.dataset.genre + " " + card.dataset.tags + " " + card.dataset.region);
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !year || card.dataset.year === year;
                    var matchRegion = !region || card.dataset.region === region;
                    var match = matchKeyword && matchYear && matchRegion;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keywordInput, yearSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            applyFilter();
        }

        var searchRoot = document.querySelector("[data-search-results]");
        if (searchRoot && window.MOVIE_SEARCH_INDEX) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim();
            var input = document.querySelector("[data-search-page-input]");
            var title = document.querySelector("[data-search-title]");
            var emptySearch = document.querySelector("[data-search-empty]");
            if (input) {
                input.value = query;
            }
            if (title) {
                title.textContent = query ? "搜索：" + query : "搜索影片";
            }


            function escapeHtml(value) {
                return String(value || "").replace(/[&<>"']/g, function (character) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;",
                        "'": "&#39;"
                    }[character];
                });
            }

            function createCard(movie) {
                var article = document.createElement("article");
                var url = escapeHtml(movie.url);
                var cover = escapeHtml(movie.cover);
                var title = escapeHtml(movie.title);
                article.className = "movie-card";
                article.innerHTML = [
                    '<a class="poster-link" href="' + url + '">',
                    '<img src="' + cover + '" alt="' + title + '" loading="lazy">',
                    '<span class="badge">' + escapeHtml(movie.year) + '</span>',
                    '<span class="play-dot">▶</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<a class="movie-card-title" href="' + url + '">' + title + '</a>',
                    '<p class="movie-card-desc">' + escapeHtml(movie.description) + '</p>',
                    '<div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                    '</div>'
                ].join("");
                return article;
            }

            var words = query.toLowerCase().split(/\s+/).filter(Boolean);
            var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                if (!words.length) {
                    return false;
                }
                var haystack = [movie.title, movie.description, movie.genre, movie.tags, movie.region, movie.category, movie.year].join(" ").toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 180);

            searchRoot.innerHTML = "";
            results.forEach(function (movie) {
                searchRoot.appendChild(createCard(movie));
            });
            if (emptySearch) {
                emptySearch.classList.toggle("is-visible", results.length === 0);
            }
        }
    });
})();
