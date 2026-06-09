(function () {
    const configElement = document.getElementById("player-config");
    const video = document.getElementById("playerVideo");
    const overlay = document.getElementById("playerOverlay");
    const playButton = document.getElementById("playButton");

    if (!configElement || !video || !overlay || !playButton) {
        return;
    }

    const config = JSON.parse(configElement.textContent);
    let ready = false;
    let hlsInstance = null;

    function prepare() {
        if (ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = config.url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(config.url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.url;
        }

        video.controls = true;
        ready = true;
    }

    function start() {
        prepare();
        overlay.classList.add("is-hidden");
        const request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
    });

    overlay.addEventListener("click", start);

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
