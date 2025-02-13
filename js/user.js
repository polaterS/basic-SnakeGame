class UserManager {
    constructor() {
        this.username = localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || '';
        this.usernameScreen = document.getElementById('usernameScreen');
        this.mainMenu = document.getElementById('mainMenu');
        this.usernameInput = document.getElementById('usernameInput');
        this.usernameSubmit = document.getElementById('usernameSubmit');
        this.usernameError = document.getElementById('usernameError');
        this.currentUsername = document.getElementById('currentUsername');
        
        this.init();
    }

    init() {
        this.checkUsername();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.usernameSubmit.addEventListener('click', () => this.handleUsernameSubmit());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUsernameSubmit();
        });
    }

    checkUsername() {
        if (this.username) {
            this.showMainMenu();
        } else {
            this.showUsernameScreen();
        }
    }

    handleUsernameSubmit() {
        const username = this.usernameInput.value.trim();
        
        if (username.length < 3) {
            this.usernameError.textContent = 'Kullanıcı adı en az 3 karakter olmalıdır.';
            return;
        }

        this.username = username;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USERNAME, username);
        this.showMainMenu();
    }

    showUsernameScreen() {
        this.usernameScreen.classList.remove('hidden');
        this.mainMenu.classList.add('hidden');
        this.usernameInput.focus();
    }

    showMainMenu() {
        this.usernameScreen.classList.add('hidden');
        this.mainMenu.classList.remove('hidden');
        this.currentUsername.textContent = `Hoş geldin, ${this.username}!`;
    }

    getUsername() {
        return this.username;
    }
}

// User manager instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
}); 