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

        if (scores.length === 0) {
            leaderboardElement.innerHTML = '<div class="no-scores">Henüz skor yok</div>';
            return;
        }

        const leaderboardHTML = scores.map((score, index) => `
            <div class="leaderboard-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-username">${score.username || 'İsimsiz Oyuncu'}</div>
                <div class="leaderboard-score">${score.score} puan</div>
                <div class="leaderboard-map">${score.mapName}</div>
                <div class="leaderboard-date">${new Date(score.date).toLocaleDateString('tr-TR')}</div>
            </div>
        `).join('');

        leaderboardElement.innerHTML = leaderboardHTML;
    }
}

const leaderboardStyle = `
    .leaderboard-screen {
        max-width: 800px !important;
    }

    .leaderboard-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .leaderboard-controls select {
        flex: 1;
        padding: 0.8rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-color);
        border: 1px solid var(--border-color);
        font-size: 1rem;
    }

    .leaderboard-content {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 1rem;
        max-height: 500px;
        overflow-y: auto;
    }

    .leaderboard-entry {
        display: grid;
        grid-template-columns: 60px 2fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        align-items: center;
        transition: transform 0.2s;
    }

    .leaderboard-entry:hover {
        transform: translateX(5px);
        background: rgba(255, 255, 255, 0.1);
    }

    .leaderboard-entry.top-1 {
        background: linear-gradient(45deg, #FFD700, #FFA500);
    }

    .leaderboard-entry.top-2 {
        background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
    }

    .leaderboard-entry.top-3 {
        background: linear-gradient(45deg, #CD7F32, #8B4513);
    }

    .leaderboard-rank {
        font-weight: bold;
        font-size: 1.2rem;
    }

    .leaderboard-username {
        font-weight: 500;
        color: var(--primary-color);
    }

    .leaderboard-score {
        font-weight: bold;
        color: #4CAF50;
    }

    .leaderboard-map {
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .leaderboard-date {
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .no-scores {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: var(--text-color);
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        .leaderboard-entry {
            grid-template-columns: 50px 1fr 1fr;
            font-size: 0.9rem;
        }

        .leaderboard-map, .leaderboard-date {
            display: none;
        }
    }
`;

document.getElementById('dynamicStyles').textContent += leaderboardStyle; 