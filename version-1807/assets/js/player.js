(function () {
  function attachSource(video, source) {
    if (!video || !source) {
      return;
    }

    if (video.__hlsPlayer) {
      video.__hlsPlayer.destroy();
      video.__hlsPlayer = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.__hlsPlayer = hls;
      return;
    }

    video.src = source;
    video.load();
  }

  window.initializeMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var trigger = document.getElementById(options.triggerId);
    var source = options.source;
    var loaded = false;

    function start() {
      if (!video) {
        return;
      }

      if (!loaded) {
        attachSource(video, source);
        loaded = true;
      }

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  };
})();
