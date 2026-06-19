(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function readStream(player) {
    var node = player.querySelector('.stream-data');
    if (!node) {
      return '';
    }
    try {
      var data = JSON.parse(node.textContent || '{}');
      return data.url || '';
    } catch (error) {
      return '';
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var startButtons = Array.prototype.slice.call(document.querySelectorAll('.player-start'));
    var url = readStream(player);
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function attach() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute('data-ready', 'true');
    }

    function play() {
      attach();
      hideCover();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    startButtons.forEach(function (button) {
      button.addEventListener('click', play);
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideCover);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
  });
})();
