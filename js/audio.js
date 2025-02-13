class AudioManager {
    constructor() {
        // Boş constructor
    }

    play(soundName) {
        // Ses çalma devre dışı
        return;
    }

    stopBackground() {
        // Arka plan müziği devre dışı
        return;
    }

    startBackground() {
        // Arka plan müziği devre dışı
        return;
    }
}

window.audioManager = new AudioManager();

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