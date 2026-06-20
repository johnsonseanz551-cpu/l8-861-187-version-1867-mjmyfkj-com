(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.getElementById("menuToggle");
        var nav = document.getElementById("mainNav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
            });
        });
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll(".filter-form").forEach(function (form) {
            var scope = form.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!cards.length) {
                return;
            }
            var keyword = form.querySelector(".filter-keyword");
            var type = form.querySelector(".filter-type");
            var year = form.querySelector(".filter-year");
            var empty = scope.querySelector(".empty-state");
            var apply = function () {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    if (q && textOf(card).indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            };
            [keyword, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initHero() {
        var root = document.getElementById("heroCarousel");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer = null;
        var show = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };
        var start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-index")) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function applyLibraryQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector(".filter-keyword");
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    ready(function () {
        initMenu();
        initFilters();
        initHero();
        applyLibraryQuery();
    });
})();
