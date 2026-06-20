(function () {
    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initSiteSearch() {
        document.querySelectorAll("[data-site-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./movies.html";
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
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
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        root.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        root.addEventListener("mouseleave", play);
        play();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");
        if (!panel || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var input = panel.querySelector("[data-filter-input]");
        var category = panel.querySelector("[data-filter-category]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        function match(card) {
            var hay = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" ").toLowerCase();
            var q = input ? text(input.value) : "";
            var c = category ? text(category.value) : "";
            var r = region ? text(region.value) : "";
            var y = year ? text(year.value) : "";
            if (q && hay.indexOf(q) === -1) {
                return false;
            }
            if (c && text(card.getAttribute("data-category")) !== c) {
                return false;
            }
            if (r && text(card.getAttribute("data-region")).indexOf(r) === -1) {
                return false;
            }
            if (y && text(card.getAttribute("data-year")).indexOf(y) === -1) {
                return false;
            }
            return true;
        }
        function update() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = match(card);
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }
        [input, category, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-broken");
            }, { once: true });
        });
    }

    function initPlayers() {
        document.querySelectorAll(".video-frame").forEach(function (frame) {
            var video = frame.querySelector("video.stream-player");
            var button = frame.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var started = false;
            function prepare() {
                if (started || !stream) {
                    return;
                }
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }
            function start() {
                prepare();
                frame.classList.add("is-playing");
                var play = video.play();
                if (play && typeof play.catch === "function") {
                    play.catch(function () {
                        frame.classList.remove("is-playing");
                    });
                }
            }
            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                frame.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    frame.classList.remove("is-playing");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSiteSearch();
        initHero();
        initFilters();
        initImages();
        initPlayers();
    });
})();
