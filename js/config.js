const CONFIG = {
    GAME: {
        CANVAS_SIZE: 600,
        GRID_SIZE: 20,
        INITIAL_SNAKE_LENGTH: 3,
        GAME_SPEED: 100,
        FOOD_COLOR: '#ff4444',
        SNAKE_COLORS: {
            PLAYER: '#4CAF50',
            OPPONENT: '#2196F3'
        }
    },
    CONTROLS: {
        UP: ['ArrowUp', 'w', 'W'],
        DOWN: ['ArrowDown', 's', 'S'],
        LEFT: ['ArrowLeft', 'a', 'A'],
        RIGHT: ['ArrowRight', 'd', 'D']
    },
    STORAGE_KEYS: {
        USERNAME: 'snakeGameUsername',
        THEME: 'snakeGameTheme'
    },
    MULTIPLAYER: {
        ICE_SERVERS: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    }
}; 