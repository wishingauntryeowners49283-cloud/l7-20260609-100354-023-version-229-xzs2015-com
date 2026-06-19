(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    var slider = document.querySelector('.hero-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }
    start();
  }

  function setupHeaderSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
    var data = window.QIQI_SEARCH_DATA || [];
    inputs.forEach(function (input) {
      var panel = input.parentElement ? input.parentElement.querySelector('.search-panel') : null;
      if (!panel) {
        return;
      }

      function render() {
        var keyword = normalize(input.value);
        if (!keyword) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        var results = data.filter(function (item) {
          var haystack = normalize([item.t, item.y, item.r, item.g, item.tp, item.d].join(' '));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 8);

        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          panel.classList.add('is-open');
          return;
        }

        panel.innerHTML = results.map(function (item) {
          return '<a class="search-result" href="' + item.u + '">' +
            '<img src="' + item.c + '" alt="' + escapeHtml(item.t) + '">' +
            '<span><strong>' + escapeHtml(item.t) + '</strong><em>' + escapeHtml(item.y + ' · ' + item.r + ' · ' + item.tp) + '</em></span>' +
            '</a>';
        }).join('');
        panel.classList.add('is-open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupLibraryFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var section = panel.closest('.page-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.js-filter-card'));
      var empty = section.querySelector('.empty-state');
      var search = panel.querySelector('.library-search-input');
      var type = panel.querySelector('.library-type-select');
      var region = panel.querySelector('.library-region-select');
      var year = panel.querySelector('.library-year-select');

      function apply() {
        var keyword = normalize(search && search.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && search) {
        search.value = q;
        apply();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupLibraryFilters();
  });
})();
