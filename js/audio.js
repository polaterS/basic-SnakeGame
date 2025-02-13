class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = localStorage.getItem('snakeGameMuted') === 'true';
        this.volume = parseFloat(localStorage.getItem('snakeGameVolume')) || 0.5;
        
        this.loadSounds();
        this.setupControls();
    }

    loadSounds() {
        // Oyun sesleri
        this.sounds = {
            eat: new Audio('sounds/eat.mp3'),
            collision: new Audio('sounds/collision.mp3'),
            powerup: new Audio('sounds/powerup.mp3'),
            button: new Audio('sounds/button.mp3')
        };

        // Arkaplan müziği
        this.music = new Audio('sounds/background.mp3');
        this.music.loop = true;

        // Tüm seslere volume ayarı
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
        this.music.volume = this.volume * 0.5; // Müzik biraz daha kısık
    }

    setupControls() {
        // Ses kontrol butonlarını oluştur
        const controls = document.createElement('div');
        controls.className = 'audio-controls';
        controls.innerHTML = `
            <button id="toggleSound" class="icon-button">
                ${this.isMuted ? '🔇' : '🔊'}
            </button>
            <input type="range" id="volumeSlider" 
                min="0" max="1" step="0.1" 
                value="${this.volume}">
        `;

        document.body.appendChild(controls);

        // Event listener'ları ekle
        const toggleBtn = document.getElementById('toggleSound');
        const volumeSlider = document.getElementById('volumeSlider');

        toggleBtn.addEventListener('click', () => this.toggleMute());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    play(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        // Sesi baştan başlat
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(err => console.log('Ses çalınamadı:', err));
    }

    startMusic() {
        if (this.isMuted) return;
        this.music.play().catch(err => console.log('Müzik başlatılamadı:', err));
    }

    stopMusic() {
        this.music.pause();
        this.music.currentTime = 0;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('snakeGameMuted', this.isMuted);

        // UI güncelle
        document.getElementById('toggleSound').textContent = this.isMuted ? '🔇' : '🔊';

        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        localStorage.setItem('snakeGameVolume', this.volume);

        // Tüm ses seviyelerini güncelle
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
        this.music.volume = this.volume * 0.5;
    }
}

// Stil ekle
const style = document.createElement('style');
style.textContent = `
.audio-controls {
    position: fixed;
    top: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    border-radius: 5px;
}

.icon-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem;
}

#volumeSlider {
    width: 100px;
    height: 5px;
    -webkit-appearance: none;
    background: var(--primary-color);
    border-radius: 5px;
    outline: none;
}

#volumeSlider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
}
`;

document.head.appendChild(style);

// AudioManager instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioManager = new AudioManager();
}); 