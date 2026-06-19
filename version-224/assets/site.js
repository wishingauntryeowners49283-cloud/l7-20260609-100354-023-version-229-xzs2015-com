(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    let current = 0;

    const showSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const searchInputs = Array.from(document.querySelectorAll('.movie-search'));
  const filterSelects = Array.from(document.querySelectorAll('.movie-filter'));
  const movieCards = Array.from(document.querySelectorAll('.movie-card'));

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get('q');

  if (queryValue && searchInputs.length) {
    searchInputs[0].value = queryValue;
  }

  const collectSearch = function () {
    return searchInputs
      .map(function (input) {
        return input.value.trim().toLowerCase();
      })
      .find(Boolean) || '';
  };

  const collectFilter = function () {
    return filterSelects
      .map(function (select) {
        return select.value;
      })
      .find(function (value) {
        return value && value !== 'all';
      }) || 'all';
  };

  const applyFilters = function () {
    if (!movieCards.length) {
      return;
    }

    const keyword = collectSearch();
    const filter = collectFilter();

    movieCards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();

      const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchFilter = filter === 'all' || haystack.indexOf(filter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
    });
  };

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('form[data-local-search="true"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });
  });

  if (queryValue) {
    applyFilters();
  }
})();
