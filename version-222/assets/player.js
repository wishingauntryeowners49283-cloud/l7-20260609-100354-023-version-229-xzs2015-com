import { H as Hls } from './hls.js';

var video = document.getElementById('movie-player');
var playButton = document.querySelector('[data-play-button]');
var hlsInstance = null;

function attachSource() {
  if (!video) {
    return Promise.reject(new Error('播放器不存在'));
  }

  var source = video.getAttribute('data-src');

  if (!source) {
    return Promise.reject(new Error('播放源不存在'));
  }

  if (video.getAttribute('data-loaded') === 'true') {
    return Promise.resolve();
  }

  video.setAttribute('data-loaded', 'true');

  return new Promise(function (resolve, reject) {
    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          reject(new Error(data.details || 'HLS 播放错误'));
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        resolve();
      }, { once: true });
      video.addEventListener('error', function () {
        reject(new Error('浏览器无法加载播放源'));
      }, { once: true });
    } else {
      reject(new Error('当前浏览器不支持 HLS 播放'));
    }
  });
}

function playVideo() {
  attachSource()
    .then(function () {
      if (playButton) {
        playButton.classList.add('hidden');
      }
      return video.play();
    })
    .catch(function (error) {
      window.alert(error.message || '播放失败，请稍后重试');
    });
}

if (playButton) {
  playButton.addEventListener('click', playVideo);
}

if (video) {
  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (playButton && video.currentTime === 0) {
      playButton.classList.remove('hidden');
    }
  });
}

window.addEventListener('beforeunload', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
