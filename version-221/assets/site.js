(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var words = filterInputs.map(function (input) {
            return normalize(input.value);
        }).filter(Boolean);
        var selectedYear = yearFilter ? normalize(yearFilter.value) : "";
        var selectedType = typeFilter ? normalize(typeFilter.value) : "";

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardType = normalize(card.getAttribute("data-type"));
            var wordMatch = words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
            var yearMatch = !selectedYear || cardYear === selectedYear;
            var typeMatch = !selectedType || cardType === selectedType;
            card.classList.toggle("hidden", !(wordMatch && yearMatch && typeMatch));
        });
    }

    filterInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
    });

    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
    }

    var video = document.querySelector("[data-player-video]");
    var playButton = document.querySelector("[data-player-button]");
    var hlsInstance = null;
    var videoReady = false;

    function getVideoUrl() {
        if (playButton && playButton.getAttribute("data-video")) {
            return playButton.getAttribute("data-video");
        }

        return video ? video.getAttribute("data-video") : "";
    }

    function loadVideo() {
        if (!video || videoReady) {
            return;
        }

        var videoUrl = getVideoUrl();

        if (!videoUrl) {
            return;
        }

        videoReady = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function playVideo() {
        if (!video) {
            return;
        }

        loadVideo();

        if (playButton) {
            playButton.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!videoReady) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
        });
    }

    if (playButton) {
        playButton.addEventListener("click", playVideo);
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
})();
