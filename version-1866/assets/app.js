(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const menuButton = $('.menu-toggle');
    const mobilePanel = $('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('open');
        });
    }

    function setupHero() {
        const hero = $('.hero');
        if (!hero) {
            return;
        }

        const slides = $$('.hero-slide', hero);
        const dots = $$('.hero-dot', hero);
        const prev = $('.hero-prev', hero);
        const next = $('.hero-next', hero);
        let current = 0;
        let timer = null;

        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(current + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = Number(dot.dataset.slideTo || '0');
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupListFilter() {
        const simpleFilter = $('[data-filter-scope="category"], [data-filter-scope="ranking"]');
        if (simpleFilter) {
            const input = $('input', simpleFilter);
            const cards = $$('[data-card-list] .movie-card');
            const apply = () => {
                const keyword = normalize(input.value);
                let visible = 0;
                cards.forEach((card) => {
                    const text = normalize(card.textContent + ' ' + Object.values(card.dataset).join(' '));
                    const match = !keyword || text.includes(keyword);
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                setNoResult(cards[0]?.parentElement, visible);
            };
            simpleFilter.addEventListener('submit', (event) => {
                event.preventDefault();
                apply();
            });
            input.addEventListener('input', apply);
        }

        const advanced = $('[data-filter-scope="search"]');
        if (advanced) {
            const params = new URLSearchParams(window.location.search);
            const q = $('[name="q"]', advanced);
            const category = $('[name="category"]', advanced);
            const region = $('[name="region"]', advanced);
            const year = $('[name="year"]', advanced);
            const cards = $$('[data-card-list] .movie-card');
            const status = $('.filter-status');

            if (q) {
                q.value = params.get('q') || '';
            }
            if (category) {
                category.value = params.get('category') || '';
            }
            if (region) {
                region.value = params.get('region') || '';
            }
            if (year) {
                year.value = params.get('year') || '';
            }

            const apply = () => {
                const keyword = normalize(q?.value);
                const categoryValue = normalize(category?.value);
                const regionValue = normalize(region?.value);
                const yearValue = normalize(year?.value);
                let visible = 0;

                cards.forEach((card) => {
                    const text = normalize(card.textContent + ' ' + Object.values(card.dataset).join(' '));
                    const matchKeyword = !keyword || text.includes(keyword);
                    const matchCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
                    const matchRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
                    const matchYear = !yearValue || text.includes(yearValue);
                    const match = matchKeyword && matchCategory && matchRegion && matchYear;
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = visible > 0 ? `已匹配 ${visible} 部影片。` : '没有匹配内容。';
                }
                setNoResult(cards[0]?.parentElement, visible);
            };

            advanced.addEventListener('submit', (event) => {
                event.preventDefault();
                apply();
            });
            [q, category, region, year].forEach((field) => {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
            apply();
        }
    }

    function setNoResult(container, count) {
        if (!container) {
            return;
        }
        let node = $('.no-result', container);
        if (count === 0) {
            if (!node) {
                node = document.createElement('div');
                node.className = 'no-result';
                node.textContent = '没有匹配内容，请更换关键词。';
                container.appendChild(node);
            }
        } else if (node) {
            node.remove();
        }
    }

    function setupPlayer() {
        const players = $$('[data-player]');
        players.forEach((box) => {
            const video = $('video', box);
            const button = $('.play-overlay', box);
            const stream = box.dataset.stream;
            let ready = false;

            const load = () => {
                if (!video || !stream) {
                    return;
                }

                if (!ready) {
                    if (window.Hls && window.Hls.isSupported()) {
                        const hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                    ready = true;
                }

                box.classList.add('playing');
                const played = video.play();
                if (played && typeof played.catch === 'function') {
                    played.catch(() => {
                        box.classList.remove('playing');
                    });
                }
            };

            if (button) {
                button.addEventListener('click', load);
            }
            if (video) {
                video.addEventListener('click', () => {
                    if (!ready || video.paused) {
                        load();
                    }
                });
                video.addEventListener('play', () => box.classList.add('playing'));
                video.addEventListener('pause', () => {
                    if (video.currentTime === 0) {
                        box.classList.remove('playing');
                    }
                });
            }
        });
    }

    function setupAnchorPlayButtons() {
        $$('a[href="#player"]').forEach((link) => {
            link.addEventListener('click', () => {
                window.setTimeout(() => {
                    const player = $('[data-player]');
                    const button = player ? $('.play-overlay', player) : null;
                    if (button) {
                        button.focus({ preventScroll: true });
                    }
                }, 240);
            });
        });
    }

    setupHero();
    setupListFilter();
    setupPlayer();
    setupAnchorPlayButtons();
})();
