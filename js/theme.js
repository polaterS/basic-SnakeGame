class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
        
        // DOM değişikliklerini izle
        this.observeDOM();
    }

    setupEventListeners() {
        // Ana menüdeki tema butonu
        document.addEventListener('click', (e) => {
            if (e.target.id === 'themeToggle' || e.target.id === 'gameThemeToggle') {
                this.toggleTheme();
            }
        });
    }

    observeDOM() {
        // DOM değişikliklerini izle
        const observer = new MutationObserver(() => {
            this.updateButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    updateButtons() {
        const icon = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // Ana menü butonu
        const mainButton = document.getElementById('themeToggle');
        if (mainButton) {
            mainButton.textContent = icon;
        }

        // Oyun ekranı butonu
        const gameButton = document.getElementById('gameThemeToggle');
        if (gameButton) {
            gameButton.textContent = icon;
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateButtons();
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }
}

// Theme manager instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
}); 