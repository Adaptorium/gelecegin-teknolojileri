(function () {
    var STORAGE_KEY = 'mars-muzik-tercihi';
    var VIDEO_ID = 'lOaxSlJzn08';

    function addIntro() {
        var intro = document.createElement('div');
        intro.className = 'intro-screen';
        for (var i = 0; i < 48; i += 1) {
            var tile = document.createElement('span');
            tile.className = 'intro-tile';
            tile.style.setProperty('--tile-delay', (0.012 * ((i * 13) % 24)) + 's');
            intro.appendChild(tile);
        }
        document.body.appendChild(intro);
        window.setTimeout(function () { intro.classList.add('is-leaving'); }, 900);
        window.setTimeout(function () { intro.remove(); }, 1600);
    }

    function addScene() {
        var scene = document.createElement('div');
        scene.className = 'orbit-scene';
        scene.innerHTML = '<div class="mars-orbit"><span class="orbit-planet one"></span><span class="orbit-planet two"></span><span class="orbit-planet three"></span></div><div class="mars-orb"></div>';
        document.body.appendChild(scene);
    }

    function addPageTransition() {
        var transition = document.createElement('div');
        transition.className = 'page-transition';
        document.body.appendChild(transition);
        document.addEventListener('click', function (event) {
            var link = event.target.closest('a[href]');
            if (!link || link.target === '_blank' || link.origin !== window.location.origin || link.pathname === window.location.pathname) return;
            event.preventDefault();
            transition.classList.add('is-active');
            window.setTimeout(function () { window.location.href = link.href; }, 360);
        });
    }

    function addFlightSimulation() {
        var launchButton = document.getElementById('launchButton');
        if (!launchButton) return;

        var thrustButton = document.getElementById('thrustButton');
        var brakeButton = document.getElementById('brakeButton');
        var autopilotButton = document.getElementById('autopilotButton');
        var resetButton = document.getElementById('resetFlightButton');
        var modeSelect = document.getElementById('flightMode');
        var status = document.getElementById('missionStatus');
        var fuelValue = document.getElementById('fuelValue');
        var fuelMeter = document.getElementById('fuelMeter');
        var distanceValue = document.getElementById('distanceValue');
        var speedValue = document.getElementById('speedValue');
        var timeValue = document.getElementById('timeValue');
        var routeValue = document.getElementById('routeValue');
        var altitudeValue = document.getElementById('altitudeValue');
        var headingValue = document.getElementById('headingValue');
        var trajectoryLabel = document.getElementById('trajectoryLabel');
        var throttleControl = document.getElementById('throttleControl');
        var throttleValue = document.getElementById('throttleValue');
        var yawLeft = document.getElementById('yawLeft');
        var yawRight = document.getElementById('yawRight');
        var routeProgress = document.querySelector('.route-progress');
        var shipMarker = document.querySelector('.ship-marker');
        var log = document.getElementById('missionLog');
        var timer;
        var state = { active: false, autopilot: false, fuel: 100, distance: 225, speed: 0, altitude: 0, heading: 90, seconds: 0 };

        function writeLog(text) { log.textContent = text; }
        function routeName() {
            return modeSelect.value === 'direct' ? 'DOĞRUDAN' : modeSelect.value === 'eco' ? 'EKO-SEYİR' : 'HOHMANN';
        }
        function render() {
            var progress = Math.max(0, Math.min(100, ((225 - state.distance) / 225) * 100));
            fuelValue.textContent = Math.ceil(state.fuel) + '%';
            fuelMeter.style.width = Math.max(0, state.fuel) + '%';
            distanceValue.textContent = Math.max(0, state.distance).toFixed(1) + 'M km';
            speedValue.textContent = state.speed.toFixed(1) + ' km/s';
            timeValue.textContent = String(Math.floor(state.seconds / 60)).padStart(2, '0') + ':' + String(state.seconds % 60).padStart(2, '0');
            routeValue.textContent = routeName();
            altitudeValue.textContent = Math.round(state.altitude) + ' km';
            headingValue.textContent = String(Math.round(state.heading)).padStart(3, '0') + '°';
            throttleValue.textContent = throttleControl.value + '%';
            trajectoryLabel.textContent = state.autopilot ? 'OTOPİLOT / ' + routeName() : 'TRANSFER YÖRÜNGESİ';
            routeProgress.style.width = progress + '%';
            shipMarker.style.left = progress + '%';
        }
        function setControls(enabled) {
            thrustButton.disabled = !enabled;
            brakeButton.disabled = !enabled;
            autopilotButton.disabled = !enabled;
            yawLeft.disabled = !enabled;
            yawRight.disabled = !enabled;
            launchButton.disabled = enabled;
        }
        function finish(success) {
            window.clearInterval(timer);
            state.active = false;
            setControls(false);
            status.textContent = success ? 'GÖREV TAMAMLANDI' : 'YAKIT TÜKENDİ';
            writeLog(success ? 'Mars yörüngesine ulaştın. Görev başarıyla tamamlandı.' : 'Yakıt rezervi bitti. Yeni bir görev başlatıp rotayı daha verimli kullan.');
            render();
        }
        function tick() {
            if (!state.active) return;
            state.seconds += 1;
            if (state.autopilot) {
                var burn = modeSelect.value === 'direct' ? 1.2 : modeSelect.value === 'eco' ? 0.42 : 0.72;
                state.fuel = Math.max(0, state.fuel - burn);
                throttleControl.value = modeSelect.value === 'eco' ? 42 : 72;
                state.speed = Math.min(8, state.speed + (modeSelect.value === 'eco' ? 0.35 : 0.6));
                state.distance = Math.max(0, state.distance - state.speed * 0.9);
            } else {
                var throttle = Number(throttleControl.value) / 100;
                state.fuel = Math.max(0, state.fuel - (0.06 + throttle * 0.36));
                state.distance = Math.max(0, state.distance - state.speed * 0.9);
                state.speed = Math.max(0, Math.min(10, state.speed + throttle * 0.28 - 0.12));
            }
            state.altitude = Math.max(0, state.altitude + state.speed * 0.42 - 0.18);
            render();
            if (state.distance <= 0) finish(true);
            else if (state.fuel <= 0) finish(false);
        }
        launchButton.addEventListener('click', function () {
            state.active = true;
            state.speed = 1.4;
            state.altitude = 2;
            status.textContent = 'YÖRÜNGEYE ÇIKIYOR';
            setControls(true);
            writeLog('Kalkış başarılı. İtkiyi dengeli kullan ve yakıtı koru.');
            timer = window.setInterval(tick, 1000);
            render();
        });
        thrustButton.addEventListener('click', function () {
            if (!state.active || state.fuel < 4) return;
            state.fuel = Math.max(0, state.fuel - 4);
            state.speed = Math.min(10, state.speed + 2.4);
            throttleControl.value = Math.min(100, Number(throttleControl.value) + 15);
            status.textContent = 'İTKİ UYGULANIYOR';
            writeLog('Motor yanışı tamamlandı. Hız arttı, yakıt rezervini takip et.');
            render();
        });
        brakeButton.addEventListener('click', function () {
            if (!state.active) return;
            state.speed = Math.max(0, state.speed - 2.2);
            throttleControl.value = Math.max(0, Number(throttleControl.value) - 20);
            status.textContent = 'HIZ DÜŞÜRÜLÜYOR';
            writeLog('Fren manevrası uygulandı. Yörünge dengeleniyor.');
            render();
        });
        autopilotButton.addEventListener('click', function () {
            state.autopilot = !state.autopilot;
            autopilotButton.textContent = state.autopilot ? 'Otopilotu kapat' : 'Otopilot';
            status.textContent = state.autopilot ? 'OTOPİLOT AKTİF' : 'MANUEL KONTROL';
            writeLog(state.autopilot ? routeName() + ' rotası otomatik olarak yönetiliyor.' : 'Manuel kontrole dönüldü.');
            render();
        });
        modeSelect.addEventListener('change', function () {
            writeLog('Yeni rota seçildi: ' + routeName() + '.');
            render();
        });
        throttleControl.addEventListener('input', render);
        yawLeft.addEventListener('click', function () {
            state.heading = (state.heading + 355) % 360;
            writeLog('Baş yönü sola kırıldı. Yeni baş: ' + String(Math.round(state.heading)).padStart(3, '0') + '°.');
            render();
        });
        yawRight.addEventListener('click', function () {
            state.heading = (state.heading + 5) % 360;
            writeLog('Baş yönü sağa kırıldı. Yeni baş: ' + String(Math.round(state.heading)).padStart(3, '0') + '°.');
            render();
        });
        resetButton.addEventListener('click', function () {
            window.clearInterval(timer);
            state = { active: false, autopilot: false, fuel: 100, distance: 225, speed: 0, altitude: 0, heading: 90, seconds: 0 };
            throttleControl.value = 60;
            autopilotButton.textContent = 'Otopilot';
            status.textContent = 'BEKLEMEDE';
            setControls(false);
            writeLog('Kontrol odası hazır. Görevi başlatıp rotanı seç.');
            render();
        });
        render();
    }

    function startSound(frame) {
        frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [2] }), '*');
        frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    }

    function addMusicPlayer() {
        var panel = document.createElement('div');
        panel.className = 'muzik-panel';
        panel.innerHTML =
            '<iframe src="https://www.youtube-nocookie.com/embed/' + VIDEO_ID +
            '?autoplay=1&mute=0&loop=1&playlist=' + VIDEO_ID +
            '&controls=0&modestbranding=1&rel=0&enablejsapi=1" allow="autoplay; encrypted-media" title="Arka plan müziği"></iframe>';

        document.body.appendChild(panel);
        var frame = panel.querySelector('iframe');
        frame.addEventListener('load', function () { startSound(frame); });
    }

    function askForMusic() {
        var prompt = document.createElement('div');
        prompt.className = 'music-consent';
        prompt.innerHTML = '<div><strong>Atmosfer müziği açılsın mı?</strong><span>Ses seviyesi çok düşük tutulur.</span></div><div class="music-actions"><button type="button" class="music-yes">Aç</button><button type="button" class="music-no">Hayır</button></div>';
        document.body.appendChild(prompt);

        prompt.querySelector('.music-yes').addEventListener('click', function () {
            sessionStorage.setItem(STORAGE_KEY, 'yes');
            prompt.remove();
            addMusicPlayer();
        });

        prompt.querySelector('.music-no').addEventListener('click', function () {
            sessionStorage.setItem(STORAGE_KEY, 'no');
            prompt.remove();
        });
    }

    function kur() {
        addIntro();
        addScene();
        addPageTransition();
        addFlightSimulation();

        var preference = sessionStorage.getItem(STORAGE_KEY);
        if (preference === 'yes') addMusicPlayer();
        if (!preference) askForMusic();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', kur);
    } else {
        kur();
    }
})();
