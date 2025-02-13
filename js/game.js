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
        this.food = this.createFood();
        this.direction = 'RIGHT';
        this.score = 0;
        this.animationFrame = null;
        this.lastRenderTime = 0;
        
        this.colors = {
            background: '#1a1a1a',
            grid: 'rgba(255, 255, 255, 0.05)',
            snake: {
                head: '#4CAF50',
                body: '#388E3C',
                outline: '#2E7D32'
            },
            food: {
                main: '#FF5252',
                shine: '#FF8A80'
            }
        };

        this.setupEventListeners();
    }

    createInitialSnake() {
        return [
            { x: 5, y: 10 }, // Baş
            { x: 4, y: 10 }, // Gövde
            { x: 3, y: 10 }  // Kuyruk
        ];
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

            // Gölge efekti
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            // Yılan parçasını çiz
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            this.ctx.fillStyle = index === 0 ? this.colors.snake.head : this.colors.snake.body;
            this.ctx.fill();

            // Dış çizgi
            this.ctx.strokeStyle = this.colors.snake.outline;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Gölgeyi sıfırla
            this.ctx.shadowColor = 'transparent';
        });

        // Yemi çiz
        const foodRadius = this.cellSize / 2;
        const foodX = this.food.x * this.cellSize + foodRadius;
        const foodY = this.food.y * this.cellSize + foodRadius;

        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Ana yem şekli
        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, foodRadius * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.food.main;
        this.ctx.fill();

        // Parıltı efekti
        this.ctx.shadowColor = 'transparent';
        this.ctx.beginPath();
        this.ctx.arc(foodX - foodRadius * 0.2, foodY - foodRadius * 0.2, foodRadius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.food.shine;
        this.ctx.fill();
    }

    moveSnake() {
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
        }

        // Duvar çarpışma kontrolü
        if (head.x < 0 || head.x >= this.canvas.width / this.cellSize ||
            head.y < 0 || head.y >= this.canvas.height / this.cellSize) {
            this.gameOver();
            return;
        }

        // Kendine çarpma kontrolü
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Yem yeme kontrolü
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = `Skor: ${this.score}`;
            this.food = this.createFood();
        } else {
            this.snake.pop();
        }
    }

    gameLoop(currentTime) {
        if (!this.lastRenderTime) {
            this.lastRenderTime = currentTime;
        }

        const elapsed = currentTime - this.lastRenderTime;

        if (elapsed > 100) { // Oyun hızı (ms)
            this.moveSnake();
            this.draw();
            this.lastRenderTime = currentTime;
        }

        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('score').textContent = 'Skor: 0';
        this.lastRenderTime = 0;
        this.gameLoop(0);
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    gameOver() {
        this.stop();
        alert(`Oyun bitti! Skorunuz: ${this.score}`);
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
} 