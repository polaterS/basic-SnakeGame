const mapStyles = document.getElementById('dynamicStyles');

class MapManager {
    constructor() {
        this.maps = {
            'CLASSIC': {
                name: 'Klasik',
                thumbnail: '🟩',
                description: 'Klasik yılan oyunu deneyimi'
            },
            'DESERT': {
                name: 'Çöl',
                thumbnail: '🏜️',
                description: 'Çöl temalı harita'
            },
            'OCEAN': {
                name: 'Okyanus',
                thumbnail: '🌊',
                description: 'Su altı temalı harita'
            }
        };
    }

    generateMazeObstacles() {
        const obstacles = [];
        const size = CONFIG.GAME.GRID_SIZE;

        // Labirent duvarları
        for (let i = 0; i < size; i++) {
            if (i % 4 !== 0) continue;
            for (let j = 0; j < size; j++) {
                if (j % 3 === 0) {
                    obstacles.push({ x: i, y: j, type: 'wall' });
                }
            }
        }

        return obstacles;
    }

    generateIslandObstacles() {
        const obstacles = [];
        const size = CONFIG.GAME.GRID_SIZE;

        // Su engelleri
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if ((i + j) % 7 === 0) {
                    obstacles.push({ x: i, y: j, type: 'water' });
                }
            }
        }

        return obstacles;
    }

    generateRandomObstacles() {
        const obstacles = [];
        const size = CONFIG.GAME.GRID_SIZE;
        const obstacleCount = Math.floor(size * size * 0.1); // %10 engel

        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            
            // Başlangıç alanına engel koyma
            if (x < 4 && y < 4) continue;

            obstacles.push({ 
                x, 
                y, 
                type: Math.random() > 0.5 ? 'wall' : 'water' 
            });
        }

        return obstacles;
    }

    drawMap(ctx, mapName, cellSize) {
        const map = this.maps[mapName];
        if (!map) return;

        // Arkaplan
        ctx.fillStyle = map.background;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, CONFIG.GAME.CANVAS_SIZE, CONFIG.GAME.CANVAS_SIZE);
        ctx.globalAlpha = 1;

        // Engeller
        if (map.obstacles) {
            map.obstacles.forEach(obstacle => {
                if (obstacle.type === 'wall') {
                    ctx.fillStyle = '#795548';
                } else if (obstacle.type === 'water') {
                    ctx.fillStyle = '#2196F3';
                }
                ctx.fillRect(
                    obstacle.x * cellSize,
                    obstacle.y * cellSize,
                    cellSize - 1,
                    cellSize - 1
                );
            });
        }

        // Portallar
        if (map.portals) {
            map.portals.forEach(portal => {
                // Portal arka planı
                ctx.fillStyle = portal.color;
                ctx.beginPath();
                ctx.arc(
                    (portal.x + 0.5) * cellSize,
                    (portal.y + 0.5) * cellSize,
                    cellSize / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Portal efekti
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    (portal.x + 0.5) * cellSize,
                    (portal.y + 0.5) * cellSize,
                    cellSize / 3,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            });
        }
    }

    checkCollision(x, y, mapName) {
        const map = this.maps[mapName];
        if (!map) return false;

        // Engel kontrolü
        if (map.obstacles) {
            return map.obstacles.some(obs => obs.x === x && obs.y === y);
        }

        return false;
    }

    checkPortal(x, y, mapName) {
        const map = this.maps[mapName];
        if (!map || !map.portals) return null;

        const portal = map.portals.find(p => p.x === x && p.y === y);
        return portal ? portal.target : null;
    }

    getMapNames() {
        return Object.keys(this.maps);
    }

    getMapInfo(mapName) {
        return this.maps[mapName];
    }

    applyMapStyle(mapName) {
        const map = this.maps[mapName];
        if (map) {
            mapStyles.textContent = map.style;
        }
    }
}

// Harita seçim menüsü için stil
const style = document.createElement('style');
style.textContent = `
.map-selection {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
}

.map-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
}

.map-card:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.map-card.selected {
    border: 2px solid var(--primary-color);
}

.map-thumbnail {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.map-name {
    font-weight: 500;
    margin-bottom: 0.3rem;
}

.map-description {
    font-size: 0.8rem;
    opacity: 0.8;
}
`;

document.head.appendChild(style);

// MapManager'ı global scope'a ekle
window.MapManager = MapManager; 