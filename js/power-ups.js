class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.activePowerUp = null;
        this.powerUpTimeout = null;
        this.spawnInterval = null;
        
        // Power-up türleri ve özellikleri
        this.powerUpTypes = {
            SPEED: {
                name: 'Hız',
                color: '#FFD700',
                duration: 5000,
                effect: () => {
                    const originalSpeed = CONFIG.GAME.GAME_SPEED;
                    CONFIG.GAME.GAME_SPEED = originalSpeed * 0.5;
                    return () => {
                        CONFIG.GAME.GAME_SPEED = originalSpeed;
                    };
                },
                symbol: '⚡'
            },
            SLOW: {
                name: 'Yavaşlat',
                color: '#4169E1',
                duration: 3000,
                effect: () => {
                    if (this.game.isMultiplayer && this.game.peer) {
                        this.game.peer.send(JSON.stringify({
                            type: 'POWER_UP_EFFECT',
                            effect: 'SLOW'
                        }));
                    }
                    return () => {};
                },
                symbol: '🐌'
            },
            DOUBLE_POINTS: {
                name: '2x Puan',
                color: '#FF69B4',
                duration: 7000,
                effect: () => {
                    this.game.scoreMultiplier = 2;
                    return () => {
                        this.game.scoreMultiplier = 1;
                    };
                },
                symbol: '2️⃣'
            },
            GHOST: {
                name: 'Hayalet',
                color: '#8A2BE2',
                duration: 4000,
                effect: () => {
                    this.game.isGhost = true;
                    return () => {
                        this.game.isGhost = false;
                    };
                },
                symbol: '👻'
            },
            MAGNET: {
                name: 'Mıknatıs',
                color: '#FF4500',
                duration: 5000,
                effect: () => {
                    this.game.hasMagnet = true;
                    return () => {
                        this.game.hasMagnet = false;
                    };
                },
                symbol: '🧲'
            }
        };
    }

    start() {
        // Her 15-30 saniye arasında rastgele bir power-up spawn et
        this.spawnInterval = setInterval(() => {
            if (!this.activePowerUp) {
                this.spawnPowerUp();
            }
        }, Math.random() * 15000 + 15000);
    }

    stop() {
        clearInterval(this.spawnInterval);
        if (this.powerUpTimeout) {
            clearTimeout(this.powerUpTimeout);
        }
    }

    spawnPowerUp() {
        // Rastgele bir power-up türü seç
        const types = Object.keys(this.powerUpTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Yılanın veya yiyeceğin üzerine spawn olmasını engelle
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * CONFIG.GAME.GRID_SIZE),
                y: Math.floor(Math.random() * CONFIG.GAME.GRID_SIZE)
            };
        } while (
            this.game.snake.some(segment => 
                segment.x === position.x && segment.y === position.y) ||
            (this.game.food.x === position.x && this.game.food.y === position.y)
        );

        this.activePowerUp = {
            ...position,
            type: randomType
        };

        // 10 saniye sonra power-up'ı kaldır
        setTimeout(() => {
            if (this.activePowerUp && 
                this.activePowerUp.x === position.x && 
                this.activePowerUp.y === position.y) {
                this.activePowerUp = null;
            }
        }, 10000);
    }

    checkCollision(head) {
        if (!this.activePowerUp) return false;

        if (head.x === this.activePowerUp.x && head.y === this.activePowerUp.y) {
            this.applyPowerUp(this.activePowerUp.type);
            this.activePowerUp = null;
            return true;
        }

        return false;
    }

    applyPowerUp(type) {
        const powerUp = this.powerUpTypes[type];
        
        // Ses efekti
        if (window.audioManager) {
            window.audioManager.play('powerup');
        }

        // Efekti uygula
        const revertEffect = powerUp.effect();

        // Süre sonunda efekti kaldır
        if (this.powerUpTimeout) {
            clearTimeout(this.powerUpTimeout);
        }

        // Power-up bilgisini göster
        this.showPowerUpInfo(powerUp);

        this.powerUpTimeout = setTimeout(() => {
            revertEffect();
            this.hidePowerUpInfo();
        }, powerUp.duration);
    }

    showPowerUpInfo(powerUp) {
        let infoElement = document.getElementById('powerUpInfo');
        if (!infoElement) {
            infoElement = document.createElement('div');
            infoElement.id = 'powerUpInfo';
            document.getElementById('gameScreen').appendChild(infoElement);
        }

        infoElement.innerHTML = `
            <span class="power-up-symbol">${powerUp.symbol}</span>
            <span class="power-up-name">${powerUp.name}</span>
        `;
        infoElement.style.display = 'flex';
    }

    hidePowerUpInfo() {
        const infoElement = document.getElementById('powerUpInfo');
        if (infoElement) {
            infoElement.style.display = 'none';
        }
    }

    draw(ctx) {
        if (this.activePowerUp) {
            const powerUp = this.powerUpTypes[this.activePowerUp.type];
            
            // Power-up arkaplanı
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(
                this.activePowerUp.x * this.game.cellSize,
                this.activePowerUp.y * this.game.cellSize,
                this.game.cellSize - 1,
                this.game.cellSize - 1
            );

            // Power-up sembolü
            ctx.fillStyle = '#fff';
            ctx.font = `${this.game.cellSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                powerUp.symbol,
                (this.activePowerUp.x + 0.5) * this.game.cellSize,
                (this.activePowerUp.y + 0.5) * this.game.cellSize
            );
        }
    }
}

// Power-up bilgisi için stil ekle
const style = document.createElement('style');
style.textContent = `
#powerUpInfo {
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    display: none;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    font-size: 18px;
}

.power-up-symbol {
    font-size: 24px;
}

.power-up-name {
    font-weight: 500;
}
`;

document.head.appendChild(style); 