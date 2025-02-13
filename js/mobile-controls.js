class MobileControls {
    constructor(game) {
        this.game = game;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            this.createMobileControls();
            this.setupTouchEvents();
        }
    }

    createMobileControls() {
        // Mobil kontrol butonlarını oluştur
        const controls = document.createElement('div');
        controls.className = 'mobile-controls';
        controls.innerHTML = `
            <div class="d-pad">
                <button class="d-btn up" data-direction="UP">⬆️</button>
                <button class="d-btn right" data-direction="RIGHT">➡️</button>
                <button class="d-btn down" data-direction="DOWN">⬇️</button>
                <button class="d-btn left" data-direction="LEFT">⬅️</button>
            </div>
        `;

        document.getElementById('gameScreen').appendChild(controls);

        // Mobil için canvas boyutunu ayarla
        this.adjustCanvasSize();
        window.addEventListener('resize', () => this.adjustCanvasSize());
    }

    setupTouchEvents() {
        // D-pad kontrolleri
        const dpad = document.querySelector('.d-pad');
        dpad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const button = e.target.closest('.d-btn');
            if (button) {
                const direction = button.dataset.direction;
                this.handleDirectionChange(direction);
                button.classList.add('active');
            }
        });

        dpad.addEventListener('touchend', (e) => {
            e.preventDefault();
            document.querySelectorAll('.d-btn').forEach(btn => 
                btn.classList.remove('active'));
        });

        // Swipe kontrolleri
        let touchStartX = 0;
        let touchStartY = 0;
        const canvas = document.getElementById('gameCanvas');

        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Sayfanın kaymasını engelle
        });

        canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Minimum swipe mesafesi
            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Yatay swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.handleDirectionChange('RIGHT');
                    } else {
                        this.handleDirectionChange('LEFT');
                    }
                }
            } else {
                // Dikey swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.handleDirectionChange('DOWN');
                    } else {
                        this.handleDirectionChange('UP');
                    }
                }
            }
        });
    }

    handleDirectionChange(newDirection) {
        const currentDirection = this.game.direction;
        
        // Zıt yönlere hareket edilmesini engelle
        const invalidMoves = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };

        if (invalidMoves[newDirection] !== currentDirection) {
            this.game.direction = newDirection;
        }
    }

    adjustCanvasSize() {
        const canvas = document.getElementById('gameCanvas');
        const gameScreen = document.getElementById('gameScreen');
        const screenWidth = gameScreen.clientWidth;
        const screenHeight = gameScreen.clientHeight - 150; // Kontroller için alan bırak

        // En küçük boyutu al ve grid'e uygun hale getir
        const size = Math.min(screenWidth, screenHeight);
        const gridSize = CONFIG.GAME.GRID_SIZE;
        const cellSize = Math.floor(size / gridSize) * gridSize;

        canvas.style.width = `${cellSize}px`;
        canvas.style.height = `${cellSize}px`;
    }
}

const mobileControlsStyle = `
    .mobile-controls {
        display: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        gap: 20px;
    }

    @media (max-width: 768px) {
        .mobile-controls {
            display: flex;
        }
    }

    .mobile-controls button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(5px);
    }
`;

document.getElementById('dynamicStyles').textContent += mobileControlsStyle; 