class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.game = null;
        this.roomCode = null;

        this.multiplayerMenu = document.getElementById('multiplayerMenu');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.roomInfo = document.getElementById('roomInfo');
        this.roomCodeInput = document.getElementById('roomCode');
        this.gameLinkInput = document.getElementById('gameLink');
        this.waitingMessage = document.getElementById('waitingMessage');
        this.backToMenu = document.getElementById('backToMenu');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.backToMenu.addEventListener('click', () => this.showMainMenu());

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                const input = document.getElementById(targetId);
                input.select();
                document.execCommand('copy');
                btn.textContent = 'Kopyalandı!';
                setTimeout(() => btn.textContent = 'Kopyala', 2000);
            });
        });

        // URL ile katılım kontrolü
        window.addEventListener('load', () => this.checkUrlForGameCode());
    }

    showMainMenu() {
        this.multiplayerMenu.classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
        if (this.peer) {
            this.peer.destroy();
        }
    }

    createRoom() {
        this.peer = new Peer(null, CONFIG.MULTIPLAYER.ICE_SERVERS);

        this.peer.on('open', (id) => {
            this.roomCode = id;
            this.roomCodeInput.value = id;
            this.gameLinkInput.value = `${window.location.origin}${window.location.pathname}?room=${id}`;
            this.roomInfo.classList.remove('hidden');
            this.createRoomBtn.classList.add('hidden');
            this.waitingMessage.classList.remove('hidden');
        });

        this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.setupConnectionHandlers();
            this.startMultiplayerGame(true);
        });
    }

    joinRoom(roomCode) {
        this.peer = new Peer(null, CONFIG.MULTIPLAYER.ICE_SERVERS);

        this.peer.on('open', () => {
            this.connection = this.peer.connect(roomCode);
            this.setupConnectionHandlers();
        });
    }

    setupConnectionHandlers() {
        this.connection.on('open', () => {
            this.startMultiplayerGame(false);
        });

        this.connection.on('data', (data) => {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'SNAKE_UPDATE':
                    if (this.game) {
                        this.game.updateOpponentSnake(message.snake);
                    }
                    break;
                case 'FOOD':
                    if (this.game) {
                        this.game.updateFood(message.food);
                    }
                    break;
            }
        });

        this.connection.on('close', () => {
            alert('Bağlantı koptu!');
            this.showMainMenu();
        });
    }

    startMultiplayerGame(isHost) {
        this.multiplayerMenu.classList.add('hidden');
        this.game = new Game(true, this.connection);
        this.game.start();
    }

    checkUrlForGameCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        
        if (roomCode) {
            // Kullanıcı adı kontrolü
            if (!window.userManager.getUsername()) {
                // Kullanıcı adı yoksa, kullanıcı adı girildikten sonra odaya katılacak
                const checkInterval = setInterval(() => {
                    if (window.userManager.getUsername()) {
                        clearInterval(checkInterval);
                        this.showMultiplayerMenu();
                        this.joinRoom(roomCode);
                    }
                }, 100);
            } else {
                this.showMultiplayerMenu();
                this.joinRoom(roomCode);
            }
        }
    }

    showMultiplayerMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
        this.multiplayerMenu.classList.remove('hidden');
    }
}

// Multiplayer manager instance will be created when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.multiplayerManager = new MultiplayerManager();
}); 