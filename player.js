document.addEventListener('DOMContentLoaded', function() {
    const audioFile = 'Audio/Mate - Echoes of Dusk (Extended Mix).mp3';
    let isPlaying = false;
    
    // Пики загружаются из waveform_data.js
    const peaks = WAVEFORM_PEAKS;
    
    const audio = new Audio(audioFile);
    
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const trackTitle = document.getElementById('trackTitle');
    const waveCanvas = document.getElementById('waveCanvas');
    const ctx = waveCanvas.getContext('2d');
    
    // Установка названия трека
    trackTitle.textContent = 'Echoes of Dusk (Extended Mix)';
    
    // Отрисовка волны
    function drawWave(progress) {
        waveCanvas.width = waveCanvas.offsetWidth;
        waveCanvas.height = waveCanvas.offsetHeight;
        
        const width = waveCanvas.width;
        const height = waveCanvas.height;
        const numBars = peaks.length;
        const barWidth = width / numBars;
        
        ctx.clearRect(0, 0, width, height);
        
        // Рисуем каждую третью полоску толще
        const step = 1;
        const barWidthThick = barWidth;
        for (let i = 0; i < numBars; i += step) {
            const barHeight = peaks[i] * (height - 4);
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            if (i / numBars <= progress) {
                ctx.fillStyle = '#e0e0e0';
            } else {
                ctx.fillStyle = '#4a4a4a';
            }
            
            ctx.fillRect(x, y, barWidthThick, barHeight);
        }
    }
    
    // Воспроизведение/пауза
    const discArt = document.getElementById('discArt');
    
    playBtn.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶';
            isPlaying = false;
            discArt.classList.remove('spinning');
        } else {
            audio.play();
            playBtn.textContent = '❚❚';
            isPlaying = true;
            discArt.classList.add('spinning');
        }
    });
    
    // Обновление прогресса
    audio.addEventListener('timeupdate', function() {
        if (audio.duration) {
            const progress = audio.currentTime / audio.duration;
            progressFill.style.width = (progress * 100) + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
            drawWave(progress);
        }
    });
    
    audio.addEventListener('loadedmetadata', function() {
        durationEl.textContent = formatTime(audio.duration);
        drawWave(0);
    });
    
    audio.addEventListener('ended', function() {
        isPlaying = false;
        playBtn.textContent = '▶';
        progressFill.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        drawWave(0);
    });
    
    // Клик по волне для перемотки
    waveCanvas.addEventListener('click', function(e) {
        if (!audio.duration) return;
        const rect = waveCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        audio.currentTime = percentage * audio.duration;
        drawWave(percentage);
    });
    
    // Клик по прогресс-бару
    progressBar.addEventListener('click', function(e) {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        audio.currentTime = percentage * audio.duration;
        drawWave(percentage);
    });
    
    // Форматирование времени
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return minutes + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    // Инициализация
    drawWave(0);
    
    // Перегенерация при изменении размера окна
    window.addEventListener('resize', function() {
        const progress = audio.duration ? audio.currentTime / audio.duration : 0;
        drawWave(progress);
    });
});
