(function () {
  var data = window.QIQI_MOVIES || [];
  var searchInput = document.getElementById('searchInput');
  var categorySelect = document.getElementById('categorySelect');
  var yearInput = document.getElementById('yearInput');
  var resetButton = document.getElementById('resetSearch');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');

  if (!results || !searchInput || !categorySelect || !yearInput) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '    <span class="poster-gradient"></span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-chip">立即播放</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3 class="movie-title compact"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <a class="category-pill" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function applyFilters() {
    var query = searchInput.value.trim().toLowerCase();
    var category = categorySelect.value;
    var year = yearInput.value.trim();

    var filtered = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      var keywordMatched = !query || haystack.indexOf(query) !== -1;
      var categoryMatched = !category || movie.category === category;
      var yearMatched = !year || String(movie.year) === year;

      return keywordMatched && categoryMatched && yearMatched;
    });

    var display = filtered.slice(0, 120);
    results.innerHTML = display.map(renderCard).join('');

    if (summary) {
      summary.textContent = '找到 ' + filtered.length + ' 部影片，当前展示前 ' + display.length + ' 部。';
    }
  }

  searchInput.value = getQueryFromUrl();
  searchInput.addEventListener('input', applyFilters);
  categorySelect.addEventListener('change', applyFilters);
  yearInput.addEventListener('input', applyFilters);

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      searchInput.value = '';
      categorySelect.value = '';
      yearInput.value = '';
      applyFilters();
    });
  }

  if (searchInput.value) {
    applyFilters();
  }
})();
