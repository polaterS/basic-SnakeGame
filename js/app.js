class App {
    constructor() {
        this.singlePlayerBtn = document.getElementById('singlePlayerBtn');
        this.multiPlayerBtn = document.getElementById('multiPlayerBtn');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.mainMenu = document.getElementById('mainMenu');
        this.mapScreen = document.getElementById('mapScreen');
        this.multiplayerMenu = document.getElementById('multiplayerMenu');
        this.leaderboardScreen = document.getElementById('leaderboardScreen');
        this.mapSelection = document.getElementById('mapSelection');
        this.startGameWithMap = document.getElementById('startGameWithMap');
        this.backToMenuFromMap = document.getElementById('backToMenuFromMap');
        this.backToMenuFromLeaderboard = document.getElementById('backToMenuFromLeaderboard');
        
        this.selectedMap = 'CLASSIC';
        this.mapManager = new MapManager();
        this.leaderboardManager = new LeaderboardManager();
        
        this.setupEventListeners();
        this.createMapSelection();
        this.setupLeaderboardMapOptions();
    }

    setupEventListeners() {
        if (this.singlePlayerBtn) {
            this.singlePlayerBtn.addEventListener('click', () => {
                console.log('Tek Oyunculu butonuna tıklandı');
                this.mainMenu.classList.add('hidden');
                this.mapScreen.classList.remove('hidden');
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        if (this.multiPlayerBtn) {
            this.multiPlayerBtn.addEventListener('click', () => {
                console.log('Çok Oyunculu butonuna tıklandı');
                this.mainMenu.classList.add('hidden');
                this.multiplayerMenu.classList.remove('hidden');
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        if (this.leaderboardBtn) {
            this.leaderboardBtn.addEventListener('click', () => {
                console.log('Liderlik Tablosu butonuna tıklandı');
                this.mainMenu.classList.add('hidden');
                this.leaderboardScreen.classList.remove('hidden');
                this.leaderboardManager.updateLeaderboardDisplay();
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        if (this.startGameWithMap) {
            this.startGameWithMap.addEventListener('click', () => {
                console.log('Oyun başlatılıyor...');
                this.mapScreen.classList.add('hidden');
                const game = new Game(false, null, this.selectedMap);
                game.start();
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        if (this.backToMenuFromMap) {
            this.backToMenuFromMap.addEventListener('click', () => {
                console.log('Ana menüye dönülüyor...');
                this.mapScreen.classList.add('hidden');
                this.mainMenu.classList.remove('hidden');
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        if (this.backToMenuFromLeaderboard) {
            this.backToMenuFromLeaderboard.addEventListener('click', () => {
                console.log('Ana menüye dönülüyor...');
                this.leaderboardScreen.classList.add('hidden');
                this.mainMenu.classList.remove('hidden');
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        }

        const leaderboardType = document.getElementById('leaderboardType');
        const leaderboardMap = document.getElementById('leaderboardMap');

        if (leaderboardType) {
            leaderboardType.addEventListener('change', () => {
                this.leaderboardManager.updateLeaderboardDisplay();
            });
        }

        if (leaderboardMap) {
            leaderboardMap.addEventListener('change', () => {
                this.leaderboardManager.updateLeaderboardDisplay();
            });
        }
    }

    setupLeaderboardMapOptions() {
        const mapSelect = document.getElementById('leaderboardMap');
        if (!mapSelect) return;

        const mapNames = this.mapManager.getMapNames();
        
        mapNames.forEach(mapName => {
            const mapInfo = this.mapManager.getMapInfo(mapName);
            const option = document.createElement('option');
            option.value = mapName;
            option.textContent = `${mapInfo.thumbnail} ${mapInfo.name}`;
            mapSelect.appendChild(option);
        });
    }

    createMapSelection() {
        if (!this.mapSelection) return;

        const mapNames = this.mapManager.getMapNames();
        
        this.mapSelection.innerHTML = mapNames.map(mapName => {
            const mapInfo = this.mapManager.getMapInfo(mapName);
            return `
                <div class="map-card ${mapName === this.selectedMap ? 'selected' : ''}" 
                     data-map="${mapName}">
                    <div class="map-thumbnail">${mapInfo.thumbnail}</div>
                    <div class="map-name">${mapInfo.name}</div>
                    <div class="map-description">${mapInfo.description}</div>
                </div>
            `;
        }).join('');

        this.mapSelection.querySelectorAll('.map-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelector('.map-card.selected')?.classList.remove('selected');
                
                card.classList.add('selected');
                this.selectedMap = card.dataset.map;

                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM yüklendi, uygulama başlatılıyor...');
    window.app = new App();
}); 