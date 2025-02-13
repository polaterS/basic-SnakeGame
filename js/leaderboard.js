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

const leaderboardStyle = `
    .leaderboard-container {
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 10px;
        color: white;
        max-width: 600px;
        margin: 0 auto;
    }

    .leaderboard-filters {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .leaderboard-filters select {
        flex: 1;
        padding: 8px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .leaderboard-content {
        max-height: 400px;
        overflow-y: auto;
    }

    .leaderboard-entry {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .leaderboard-rank {
        width: 40px;
        font-weight: bold;
    }

    .leaderboard-username {
        flex: 1;
    }

    .leaderboard-score {
        width: 100px;
        text-align: right;
    }
`;

document.getElementById('dynamicStyles').textContent += leaderboardStyle; 