document.addEventListener('DOMContentLoaded', function() {
    const players = document.querySelectorAll('.player');
    
    players.forEach(function(player) {
        const audioFile = player.dataset.audio;
        if (!audioFile) return;
        
        const peaks = (typeof WAVEFORM_PEAKS !== 'undefined') ? WAVEFORM_PEAKS : [];
        
        const audio = new Audio(audioFile);
        let isPlaying = false;
        
        const playBtn = player.querySelector('.play-btn');
        const progressBar = player.querySelector('.progress-bar');
        const progressFill = player.querySelector('.progress-fill');
        const currentTimeEl = player.querySelector('.current-time');
        const durationEl = player.querySelector('.duration');
        const trackTitle = player.querySelector('.track-title');
        const waveCanvas = player.querySelector('.wave-canvas');
        const ctx = waveCanvas ? waveCanvas.getContext('2d') : null;
        
        function drawWave(progress) {
            if (!ctx || !peaks.length) return;
            waveCanvas.width = waveCanvas.offsetWidth;
            waveCanvas.height = waveCanvas.offsetHeight;
            
            const width = waveCanvas.width;
            const height = waveCanvas.height;
            const numBars = peaks.length;
            const barWidth = width / numBars;
            
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < numBars; i++) {
                const barHeight = peaks[i] * (height - 4);
                const x = i * barWidth;
                const y = (height - barHeight) / 2;
                
                if (i / numBars <= progress) {
                    ctx.fillStyle = '#e0e0e0';
                } else {
                    ctx.fillStyle = '#4a4a4a';
                }
                
                ctx.fillRect(x, y, barWidth, barHeight);
            }
        }
        
        playBtn.addEventListener('click', function() {
            if (isPlaying) {
                audio.pause();
                playBtn.textContent = '▶';
                isPlaying = false;
            } else {
                audio.play();
                playBtn.textContent = '❚❚';
                isPlaying = true;
            }
        });
        
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
        
        waveCanvas && waveCanvas.addEventListener('click', function(e) {
            if (!audio.duration) return;
            const rect = waveCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            audio.currentTime = percentage * audio.duration;
            drawWave(percentage);
        });
        
        progressBar.addEventListener('click', function(e) {
            if (!audio.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            audio.currentTime = percentage * audio.duration;
            drawWave(percentage);
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return minutes + ':' + (secs < 10 ? '0' : '') + secs;
        }
        
        drawWave(0);
        
        window.addEventListener('resize', function() {
            const progress = audio.duration ? audio.currentTime / audio.duration : 0;
            drawWave(progress);
        });
    });
});
