(function () {
    function getAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = getAll('[data-hero-slide]', hero);
        var dots = getAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var year = document.querySelector('[data-filter-year]');
        var type = document.querySelector('[data-filter-type]');
        var category = document.querySelector('[data-filter-category]');
        var clear = document.querySelector('[data-clear-search]');
        var cards = getAll('[data-card]');
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        function matches(card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            var q = normalize(input.value);
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var categoryValue = category ? category.value : '';
            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                return false;
            }
            if (typeValue && text.indexOf(normalize(typeValue)) === -1) {
                return false;
            }
            if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
                return false;
            }
            return true;
        }
        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [input, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (category) {
                    category.value = '';
                }
                apply();
                input.focus();
            });
        }
        apply();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var cover = document.querySelector('.player-cover');
        if (!video || !source) {
            return;
        }
        var ready = false;
        function setNative() {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }
            ready = true;
        }
        function start() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                setNative();
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!ready) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    ready = true;
                } else {
                    video.play().catch(function () {});
                }
                return;
            }
            setNative();
            video.play().catch(function () {});
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initFilters();
    });
}());
