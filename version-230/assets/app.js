(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function(form) {
        var root = form.parentElement && form.parentElement.parentElement ? form.parentElement.parentElement : document;
        var input = form.querySelector("[data-filter-input]");
        var region = form.querySelector("[data-filter-region]");
        var type = form.querySelector("[data-filter-type]");
        var category = form.querySelector("[data-filter-category]");
        var list = root.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
        var empty = root.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function matches(card, field, value) {
            if (!value) {
                return true;
            }
            return (card.getAttribute(field) || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value.trim() : "";
            var typeValue = type ? type.value.trim() : "";
            var categoryValue = category ? category.value.trim() : "";
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-category") || ""
                ].join(" ").toLowerCase();
                var ok = (!term || haystack.indexOf(term) !== -1) &&
                    matches(card, "data-region", regionValue) &&
                    matches(card, "data-type", typeValue) &&
                    (!categoryValue || haystack.indexOf(categoryValue.toLowerCase()) !== -1);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, region, type, category].forEach(function(control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}());
