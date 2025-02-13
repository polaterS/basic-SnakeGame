class Game {
    constructor(isMultiplayer = false, peer = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isMultiplayer = isMultiplayer;
        this.peer = peer;
        
        // Canvas boyutlarını ayarla
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        this.cellSize = this.canvas.width / 20; // 20x20 grid
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
        
        this.colors = {
            background: '#1a1a1a',
            snake: {
                head: '#4CAF50',
                body: '#388E3C'
            },
            food: '#FF5252',
            grid: 'rgba(255, 255, 255, 0.05)'
        };

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
            x: Math.floor(Math.random() * (this.canvas.width / this.cellSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.cellSize))
        };

        // Yılanın üzerine yem gelmesin
        if (this.snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            return this.createFood();
        }

        return food;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction !== 'DOWN') this.direction = 'UP';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction !== 'UP') this.direction = 'DOWN';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction !== 'RIGHT') this.direction = 'LEFT';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction !== 'LEFT') this.direction = 'RIGHT';
                    break;
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
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
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
            if (head.x < 0 || head.x >= this.canvas.width / this.cellSize ||
                head.y < 0 || head.y >= this.canvas.height / this.cellSize) {
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

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= this.canvas.width; i += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= this.canvas.height; i += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    draw() {
        // Arkaplanı temizle
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid çiz
        this.drawGrid();

        // Yılanı çiz
        this.snake.forEach((segment, index) => {
            const radius = this.cellSize / 2;
            const x = segment.x * this.cellSize + radius;
            const y = segment.y * this.cellSize + radius;

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            this.ctx.fillStyle = index === 0 ? this.colors.snake.head : this.colors.snake.body;
            this.ctx.fill();

            // Gölge efekti
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
        });

        // Rakibi çiz
        if (this.isMultiplayer && this.opponent) {
            this.opponent.forEach(segment => {
                const radius = this.cellSize / 2;
                const x = segment.x * this.cellSize + radius;
                const y = segment.y * this.cellSize + radius;

                this.ctx.beginPath();
                this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
                this.ctx.fillStyle = CONFIG.GAME.SNAKE_COLORS.OPPONENT;
                this.ctx.fill();
            });
        }

        // Yemi çiz
        const foodRadius = this.cellSize / 2;
        const foodX = this.food.x * this.cellSize + foodRadius;
        const foodY = this.food.y * this.cellSize + foodRadius;

        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, foodRadius * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fill();

        // Parıltı efekti
        this.ctx.beginPath();
        this.ctx.arc(foodX - foodRadius * 0.3, foodY - foodRadius * 0.3, foodRadius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();

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

        if (elapsed > 100) { // Oyun hızı (ms)
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