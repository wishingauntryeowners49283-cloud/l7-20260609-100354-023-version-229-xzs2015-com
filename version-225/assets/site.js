
(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function textValue(node, name) {
        return (node.getAttribute(name) || "").toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = all(".hero-slide", hero);
        var dots = all("[data-hero-dot]", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function run() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                run();
            });
        });
        show(0);
        run();
    }

    function setupFiltering() {
        all("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var sort = scope.querySelector("[data-sort]");
            var grid = scope.querySelector(".sortable-grid") || scope.querySelector(".movie-grid") || scope;
            var cards = all(".movie-card", scope);
            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var haystack = [
                        textValue(card, "data-title"),
                        textValue(card, "data-category"),
                        textValue(card, "data-year"),
                        textValue(card, "data-tags"),
                        card.textContent.toLowerCase()
                    ].join(" ");
                    card.hidden = query !== "" && haystack.indexOf(query) === -1;
                });
            }
            function applySort() {
                if (!sort || !grid) {
                    return;
                }
                var sorted = cards.slice();
                sorted.sort(function (a, b) {
                    var mode = sort.value;
                    var ay = parseInt(a.getAttribute("data-year") || "0", 10);
                    var by = parseInt(b.getAttribute("data-year") || "0", 10);
                    var as = parseInt(a.getAttribute("data-score") || "0", 10);
                    var bs = parseInt(b.getAttribute("data-score") || "0", 10);
                    var at = a.getAttribute("data-title") || "";
                    var bt = b.getAttribute("data-title") || "";
                    if (mode === "year-asc") {
                        return ay - by || at.localeCompare(bt, "zh-Hans-CN");
                    }
                    if (mode === "title-asc") {
                        return at.localeCompare(bt, "zh-Hans-CN");
                    }
                    if (mode === "score-desc") {
                        return bs - as || by - ay;
                    }
                    return by - ay || at.localeCompare(bt, "zh-Hans-CN");
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (sort) {
                sort.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
                applySort();
            }
        });
    }

    window.bindMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var loaded = false;
        var hlsInstance = null;
        if (!video || !overlay || !button || !config.source) {
            return;
        }
        function attach() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(config.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = config.source;
            }
            loaded = true;
        }
        function play() {
            attach();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        overlay.addEventListener("click", play);
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
