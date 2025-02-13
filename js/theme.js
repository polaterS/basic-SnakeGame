class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.gameThemeToggleBtn = document.getElementById('gameThemeToggle');
        this.currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Ana menüdeki tema butonu
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        
        // Oyun ekranındaki tema butonu
        if (this.gameThemeToggleBtn) {
            this.gameThemeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Ana menü butonu güncelle
        this.themeToggleBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // Oyun ekranı butonu güncelle
        if (this.gameThemeToggleBtn) {
            this.gameThemeToggleBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
        
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