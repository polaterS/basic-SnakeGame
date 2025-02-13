class AudioManager {
    constructor() {
        this.sounds = {
            button: new Audio('sounds/button.mp3'),
            eat: new Audio('sounds/eat.mp3'),
            collision: new Audio('sounds/collision.mp3'),
            powerup: new Audio('sounds/powerup.mp3'),
            background: new Audio('sounds/background.mp3')
        };

        // Arka plan müziği için ayarlar
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.3;

        // Ses efektleri için varsayılan ses seviyesi
        Object.values(this.sounds).forEach(sound => {
            if (sound !== this.sounds.background) {
                sound.volume = 0.5;
            }
        });

        // Ses hatalarını yönet
        Object.values(this.sounds).forEach(sound => {
            sound.onerror = () => {
                console.log('Ses dosyası yüklenemedi:', sound.src);
            };
        });
    }

    play(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log('Ses çalma hatası:', error);
            });
        }
    }

    stopBackground() {
        this.sounds.background.pause();
        this.sounds.background.currentTime = 0;
    }

    startBackground() {
        this.sounds.background.play().catch(error => {
            console.log('Arka plan müziği başlatma hatası:', error);
        });
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