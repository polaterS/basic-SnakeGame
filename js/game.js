class Game {
    constructor(isMultiplayer = false, peer = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isMultiplayer = isMultiplayer;
        this.peer = peer;
        
        this.canvas.width = CONFIG.GAME.CANVAS_SIZE;
        this.canvas.height = CONFIG.GAME.CANVAS_SIZE;
        
        this.cellSize = CONFIG.GAME.CANVAS_SIZE / CONFIG.GAME.GRID_SIZE;
        this.snake = this.createInitialSnake();
        this.opponent = isMultiplayer ? this.createInitialSnake(true) : null;
        this.food = this.createFood();
        this.direction = 'RIGHT';
        this.score = 0;
        this.scoreMultiplier = 1;
        this.isGhost = false;
        this.hasMagnet = false;
        this.gameLoop = null;
        this.lastRenderTime = 0;
        
        // Power-up yöneticisini başlat
        this.powerUpManager = new PowerUpManager(this);
        
        // Mobil kontrolleri başlat
        this.mobileControls = new MobileControls(this);
        
        this.setupEventListeners();

        // Oyun başladığında müziği başlat
        if (window.audioManager) {
            window.audioManager.startMusic();
        }
    }

    createInitialSnake(isOpponent = false) {
        const startX = isOpponent ? CONFIG.GAME.GRID_SIZE - 4 : 3;
        const startY = Math.floor(CONFIG.GAME.GRID_SIZE / 2);
        const snake = [];
        
        for (let i = 0; i < CONFIG.GAME.INITIAL_SNAKE_LENGTH; i++) {
            snake.push({
                x: startX - i,
                y: startY
            });
        }
        
        return snake;
    }

    createFood() {
        const food = {
            x: Math.floor(Math.random() * CONFIG.GAME.GRID_SIZE),
            y: Math.floor(Math.random() * CONFIG.GAME.GRID_SIZE)
        };

        // Ensure food doesn't spawn on snake
        const isOnSnake = this.snake.some(segment => 
            segment.x === food.x && segment.y === food.y);
        
        if (isOnSnake) return this.createFood();
        return food;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (CONFIG.CONTROLS.UP.includes(e.key) && this.direction !== 'DOWN') {
                this.direction = 'UP';
            } else if (CONFIG.CONTROLS.DOWN.includes(e.key) && this.direction !== 'UP') {
                this.direction = 'DOWN';
            } else if (CONFIG.CONTROLS.LEFT.includes(e.key) && this.direction !== 'RIGHT') {
                this.direction = 'LEFT';
            } else if (CONFIG.CONTROLS.RIGHT.includes(e.key) && this.direction !== 'LEFT') {
                this.direction = 'RIGHT';
            }
        });

        document.getElementById('exitGame').addEventListener('click', () => {
            this.stop();
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
    }

    moveSnake() {
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'UP':
                head.y--;
                break;
            case 'DOWN':
                head.y++;
                break;
            case 'LEFT':
                head.x--;
                break;
            case 'RIGHT':
                head.x++;
                break;
        }

        // Mıknatıs efekti
        if (this.hasMagnet) {
            const dx = this.food.x - head.x;
            const dy = this.food.y - head.y;
            if (Math.abs(dx) + Math.abs(dy) <= 5) { // 5 birim mesafede çekmeye başla
                if (Math.abs(dx) > Math.abs(dy)) {
                    head.x += Math.sign(dx);
                } else {
                    head.y += Math.sign(dy);
                }
            }
        }

        // Hayalet modunda duvarlardan geçiş
        if (this.isGhost) {
            if (head.x < 0) head.x = CONFIG.GAME.GRID_SIZE - 1;
            if (head.x >= CONFIG.GAME.GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = CONFIG.GAME.GRID_SIZE - 1;
            if (head.y >= CONFIG.GAME.GRID_SIZE) head.y = 0;
        } else {
            // Normal duvar çarpışma kontrolü
            if (head.x < 0 || head.x >= CONFIG.GAME.GRID_SIZE ||
                head.y < 0 || head.y >= CONFIG.GAME.GRID_SIZE) {
                if (window.audioManager) {
                    window.audioManager.play('collision');
                }
                this.gameOver();
                return;
            }
        }

        // Kendine çarpma kontrolü
        if (!this.isGhost && this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            if (window.audioManager) {
                window.audioManager.play('collision');
            }
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Power-up çarpışma kontrolü
        if (this.powerUpManager.checkCollision(head)) {
            // Power-up alındı, snake'i kısaltma
            return;
        }

        // Yem yeme kontrolü
        if (head.x === this.food.x && head.y === this.food.y) {
            if (window.audioManager) {
                window.audioManager.play('eat');
            }
            this.score += 10 * this.scoreMultiplier;
            document.getElementById('score').textContent = `Skor: ${this.score}`;
            this.food = this.createFood();
            
            if (this.isMultiplayer && this.peer) {
                this.peer.send(JSON.stringify({
                    type: 'FOOD',
                    food: this.food
                }));
            }
        } else {
            this.snake.pop();
        }

        if (this.isMultiplayer && this.peer) {
            this.peer.send(JSON.stringify({
                type: 'SNAKE_UPDATE',
                snake: this.snake
            }));
        }
    }

    draw() {
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--bg-color');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Yılanı çiz
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = this.isGhost ? 
                `${CONFIG.GAME.SNAKE_COLORS.PLAYER}88` : // Yarı saydam
                CONFIG.GAME.SNAKE_COLORS.PLAYER;
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });

        // Rakibi çiz
        if (this.isMultiplayer && this.opponent) {
            this.opponent.forEach(segment => {
                this.ctx.fillStyle = CONFIG.GAME.SNAKE_COLORS.OPPONENT;
                this.ctx.fillRect(
                    segment.x * this.cellSize,
                    segment.y * this.cellSize,
                    this.cellSize - 1,
                    this.cellSize - 1
                );
            });
        }

        // Yemi çiz
        this.ctx.fillStyle = CONFIG.GAME.FOOD_COLOR;
        this.ctx.fillRect(
            this.food.x * this.cellSize,
            this.food.y * this.cellSize,
            this.cellSize - 1,
            this.cellSize - 1
        );

        // Power-up'ları çiz
        this.powerUpManager.draw(this.ctx);

        // Mıknatıs efekti gösterimi
        if (this.hasMagnet) {
            const head = this.snake[0];
            const dx = this.food.x - head.x;
            const dy = this.food.y - head.y;
            if (Math.abs(dx) + Math.abs(dy) <= 5) {
                this.ctx.strokeStyle = '#FF4500';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(
                    (head.x + 0.5) * this.cellSize,
                    (head.y + 0.5) * this.cellSize
                );
                this.ctx.lineTo(
                    (this.food.x + 0.5) * this.cellSize,
                    (this.food.y + 0.5) * this.cellSize
                );
                this.ctx.stroke();
            }
        }
    }

    gameLoop(currentTime) {
        if (this.lastRenderTime === 0) {
            this.lastRenderTime = currentTime;
        }

        const elapsed = currentTime - this.lastRenderTime;

        if (elapsed > CONFIG.GAME.GAME_SPEED) {
            this.moveSnake();
            this.draw();
            this.lastRenderTime = currentTime;
        }

        this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('score').textContent = 'Skor: 0';
        this.powerUpManager.start();
        this.gameLoop(0);
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (window.audioManager) {
            window.audioManager.stopMusic();
        }
        this.powerUpManager.stop();
    }

    gameOver() {
        this.stop();
        
        // Skoru liderlik tablosuna ekle
        if (!this.isMultiplayer && window.app.leaderboardManager) {
            window.app.leaderboardManager.addScore(
                this.score,
                window.userManager.getUsername(),
                this.mapName
            );
        }

        alert(`Oyun bitti! Skorunuz: ${this.score}`);
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }

    updateOpponentSnake(opponentSnake) {
        this.opponent = opponentSnake;
    }

    updateFood(newFood) {
        this.food = newFood;
    }
} 