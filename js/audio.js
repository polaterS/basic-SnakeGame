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

// AudioManager instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioManager = new AudioManager();
}); 