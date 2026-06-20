(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function getParam(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-toggle-menu]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        play();
    }

    function setupFilters() {
        var list = document.querySelector("[data-movie-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var input = document.querySelector("[data-live-search]");
        var empty = document.querySelector("[data-empty-state]");
        var clear = document.querySelector("[data-clear-filter]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year], [data-filter-region], [data-filter-type]"));
        var state = {
            q: getParam("q"),
            year: "",
            region: "",
            type: ""
        };

        if (input && state.q) {
            input.value = state.q;
        }

        function apply() {
            var query = normalize(state.q);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" "));
                var ok = true;
                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (state.year && card.getAttribute("data-year") !== state.year) {
                    ok = false;
                }
                if (state.region && card.getAttribute("data-region") !== state.region) {
                    ok = false;
                }
                if (state.type && card.getAttribute("data-type").indexOf(state.type) === -1) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", function () {
                state.q = input.value;
                apply();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var key = button.hasAttribute("data-filter-year") ? "year" : button.hasAttribute("data-filter-region") ? "region" : "type";
                var value = button.getAttribute("data-filter-" + key);
                state[key] = state[key] === value ? "" : value;
                buttons.forEach(function (item) {
                    var itemKey = item.hasAttribute("data-filter-year") ? "year" : item.hasAttribute("data-filter-region") ? "region" : "type";
                    item.classList.toggle("is-active", itemKey === key && state[key] === item.getAttribute("data-filter-" + itemKey));
                });
                apply();
            });
        });

        if (clear) {
            clear.addEventListener("click", function () {
                state.q = "";
                state.year = "";
                state.region = "";
                state.type = "";
                if (input) {
                    input.value = "";
                }
                buttons.forEach(function (button) {
                    button.classList.remove("is-active");
                });
                apply();
            });
        }

        apply();
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
