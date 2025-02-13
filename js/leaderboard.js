class LeaderboardManager {
    constructor() {
        this.leaderboards = {
            daily: [],
            weekly: [],
            allTime: [],
            maps: {}
        };
        
        // Her harita için ayrı liderlik tablosu
        const mapManager = new MapManager();
        mapManager.getMapNames().forEach(mapName => {
            this.leaderboards.maps[mapName] = [];
        });

        this.loadLeaderboards();
        this.setupAutoReset();
    }

    loadLeaderboards() {
        // LocalStorage'dan liderlik tablolarını yükle
        const stored = localStorage.getItem('snakeGameLeaderboards');
        if (stored) {
            this.leaderboards = JSON.parse(stored);
        }
    }

    saveLeaderboards() {
        // LocalStorage'a kaydet
        localStorage.setItem('snakeGameLeaderboards', 
            JSON.stringify(this.leaderboards));
    }

    setupAutoReset() {
        // Günlük ve haftalık tabloları otomatik sıfırla
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(0, 0, 0, 0);

        // Günlük reset
        setTimeout(() => {
            this.leaderboards.daily = [];
            this.saveLeaderboards();
            this.setupAutoReset();
        }, tomorrow - now);

        // Haftalık reset
        setTimeout(() => {
            this.leaderboards.weekly = [];
            this.saveLeaderboards();
        }, nextWeek - now);
    }

    addScore(score, username, mapName) {
        const scoreData = {
            score,
            username,
            date: new Date().toISOString(),
            mapName
        };

        // Günlük sıralama
        this.insertScore(this.leaderboards.daily, scoreData);
        
        // Haftalık sıralama
        this.insertScore(this.leaderboards.weekly, scoreData);
        
        // Tüm zamanlar
        this.insertScore(this.leaderboards.allTime, scoreData);
        
        // Harita bazlı sıralama
        this.insertScore(this.leaderboards.maps[mapName], scoreData);

        this.saveLeaderboards();
        this.updateLeaderboardDisplay();
    }

    insertScore(leaderboard, scoreData) {
        // Maksimum 100 skor tut
        const maxScores = 100;
        
        // Skoru doğru pozisyona ekle
        const insertIndex = leaderboard.findIndex(item => item.score < scoreData.score);
        
        if (insertIndex === -1 && leaderboard.length < maxScores) {
            // En sona ekle
            leaderboard.push(scoreData);
        } else if (insertIndex !== -1) {
            // Araya ekle
            leaderboard.splice(insertIndex, 0, scoreData);
            // Maksimum sayıyı aşmamak için son elemanı sil
            if (leaderboard.length > maxScores) {
                leaderboard.pop();
            }
        }
    }

    getLeaderboard(type, mapName = null) {
        if (mapName) {
            return this.leaderboards.maps[mapName] || [];
        }
        return this.leaderboards[type] || [];
    }

    updateLeaderboardDisplay() {
        const leaderboardElement = document.getElementById('leaderboardContent');
        if (!leaderboardElement) return;

        const selectedType = document.getElementById('leaderboardType').value;
        const selectedMap = document.getElementById('leaderboardMap').value;
        
        let scores;
        if (selectedMap === 'all') {
            scores = this.getLeaderboard(selectedType);
        } else {
            scores = this.getLeaderboard('maps', selectedMap);
        }

        leaderboardElement.innerHTML = scores.length ? scores.map((score, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                <span class="rank">${index + 1}</span>
                <span class="username">${score.username}</span>
                <span class="score">${score.score}</span>
                <span class="map">${score.mapName}</span>
                <span class="date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
        `).join('') : '<div class="no-scores">Henüz skor yok</div>';
    }
}

// Liderlik tablosu için stil
const style = document.createElement('style');
style.textContent = `
.leaderboard-screen {
    max-height: 80vh;
    overflow-y: auto;
}

.leaderboard-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.leaderboard-content {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 1rem;
}

.leaderboard-item {
    display: grid;
    grid-template-columns: 50px 2fr 1fr 1fr 1fr;
    padding: 0.5rem;
    border-radius: 5px;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    transition: transform 0.2s;
}

.leaderboard-item:hover {
    transform: translateX(5px);
}

.leaderboard-item.top-1 {
    background: linear-gradient(45deg, #FFD700, #FFA500);
}

.leaderboard-item.top-2 {
    background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
}

.leaderboard-item.top-3 {
    background: linear-gradient(45deg, #CD7F32, #8B4513);
}

.rank {
    font-weight: bold;
}

.username {
    font-weight: 500;
}

.score {
    text-align: right;
}

.map {
    text-align: center;
    font-size: 0.9em;
}

.date {
    text-align: right;
    font-size: 0.9em;
    opacity: 0.8;
}

.no-scores {
    text-align: center;
    padding: 2rem;
    opacity: 0.5;
}

select {
    padding: 0.5rem;
    border-radius: 5px;
    background: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}
`;

document.head.appendChild(style); 