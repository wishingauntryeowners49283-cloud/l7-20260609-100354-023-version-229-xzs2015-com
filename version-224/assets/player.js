(function () {
  const players = Array.from(document.querySelectorAll('.player-shell'));

  players.forEach(function (box) {
    const video = box.querySelector('video');
    const cover = box.querySelector('.player-cover');
    const source = box.getAttribute('data-stream');
    let prepared = false;
    let hls = null;

    const attach = function () {
      if (prepared || !video || !source) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const play = function () {
      attach();
      box.classList.add('is-playing');
      video.controls = true;
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
