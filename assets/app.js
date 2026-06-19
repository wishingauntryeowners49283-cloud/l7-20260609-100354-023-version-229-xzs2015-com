(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayers();
    initHeroSearch();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (!slides.length || !dots.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    show(0);
    autoplay();
  }

  function initHeroSearch() {
    var form = document.querySelector('[data-hero-search]');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var keyword = input ? encodeURIComponent(input.value.trim()) : '';
      window.location.href = 'search.html' + (keyword ? '?q=' + keyword : '');
    });
  }

  function initLocalFilters() {
    var filter = document.querySelector('[data-local-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var counter = document.querySelector('[data-result-count]');

    if (!filter || !cards.length) {
      return;
    }

    var input = filter.querySelector('[data-filter-keyword]');
    var region = filter.querySelector('[data-filter-region]');
    var type = filter.querySelector('[data-filter-type]');
    var year = filter.querySelector('[data-filter-year]');

    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && normalize(card.dataset.region) !== regionValue) {
          matched = false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          matched = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');

    if (!form || !results || !window.MOVIE_DATA) {
      return;
    }

    var keywordInput = form.querySelector('[name="q"]');
    var regionSelect = form.querySelector('[name="region"]');
    var typeSelect = form.querySelector('[name="type"]');
    var yearSelect = form.querySelector('[name="year"]');
    var count = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q') && keywordInput) {
      keywordInput.value = params.get('q');
    }

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-shell" href="video/' + movie.id + '.html">',
        '    <img src="' + movie.coverIndex + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="video/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(movie.regionGroup) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '    </div>',
        '    <p>' + escapeHtml(cut(movie.oneLine || movie.summary, 76)) + '</p>',
        '    <div class="tag-list">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);

      var matched = window.MOVIE_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.regionGroup,
          movie.type,
          movie.year,
          movie.genreRaw,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' '));

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (region && normalize(movie.regionGroup) !== region) {
          return false;
        }
        if (type && normalize(movie.type) !== type) {
          return false;
        }
        if (year && normalize(movie.year) !== year) {
          return false;
        }
        return true;
      }).slice(0, 160);

      results.innerHTML = matched.length
        ? matched.map(movieCard).join('')
        : '<div class="empty-state">没有找到匹配影片，换个关键词再试。</div>';

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 条结果';
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.player-cover');
      var src = box.getAttribute('data-video-url');

      if (!video || !cover || !src) {
        return;
      }

      cover.addEventListener('click', function () {
        cover.style.display = 'none';
        attachSource(video, src, box);
      });
    });
  }

  function attachSource(video, src, box) {
    var message = box.querySelector('.player-message');

    function fail(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          fail('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          fail('播放源暂时无法加载，请稍后重试或更换浏览器。');
          hls.destroy();
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          fail('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }, { once: true });
      return;
    }

    fail('当前浏览器不支持 HLS 播放，请使用 Safari、Chrome、Edge 或移动端浏览器访问。');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cut(text, max) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
})();
