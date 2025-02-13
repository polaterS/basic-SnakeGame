class App {
    constructor() {
        this.singlePlayerBtn = document.getElementById('singlePlayerBtn');
        this.multiPlayerBtn = document.getElementById('multiPlayerBtn');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.mapScreen = document.getElementById('mapScreen');
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
        this.singlePlayerBtn.addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            this.mapScreen.classList.remove('hidden');
        });

        this.multiPlayerBtn.addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('multiplayerMenu').classList.remove('hidden');
        });

        this.leaderboardBtn.addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('leaderboardScreen').classList.remove('hidden');
            this.leaderboardManager.updateLeaderboardDisplay();
        });

        this.startGameWithMap.addEventListener('click', () => {
            this.mapScreen.classList.add('hidden');
            const game = new Game(false, null, this.selectedMap);
            game.start();
        });

        this.backToMenuFromMap.addEventListener('click', () => {
            this.mapScreen.classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });

        this.backToMenuFromLeaderboard.addEventListener('click', () => {
            document.getElementById('leaderboardScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });

        // Liderlik tablosu filtre değişikliklerini dinle
        document.getElementById('leaderboardType').addEventListener('change', () => {
            this.leaderboardManager.updateLeaderboardDisplay();
        });

        document.getElementById('leaderboardMap').addEventListener('change', () => {
            this.leaderboardManager.updateLeaderboardDisplay();
        });
    }

    setupLeaderboardMapOptions() {
        const mapSelect = document.getElementById('leaderboardMap');
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

        // Harita seçim event listener'ları
        this.mapSelection.querySelectorAll('.map-card').forEach(card => {
            card.addEventListener('click', () => {
                // Önceki seçimi kaldır
                document.querySelector('.map-card.selected')?.classList.remove('selected');
                
                // Yeni seçimi işaretle
                card.classList.add('selected');
                this.selectedMap = card.dataset.map;

                // Ses efekti
                if (window.audioManager) {
                    window.audioManager.play('button');
                }
            });
        });
    }
}

// App instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 