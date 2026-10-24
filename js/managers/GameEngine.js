import { CONFIG } from '../config.js';

export class GameEngine {
    constructor(game) {
        this.game = game;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.waveTimer = 0;
        this.spawnQueue = [];
        this.spawnInterval = 1000;
        this.lastSpawnTime = 0;
        this.lastTime = performance.now();
    }
    
    start() {
        requestAnimationFrame((time) => this.loop(time));
    }
    
    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame((t) => this.loop(t));
    }
    
    startNextWave() {
        if (this.game.waveInProgress || this.game.currentWave >= CONFIG.WAVES.length) return;
        
        const waveConfig = CONFIG.WAVES[this.game.currentWave];
        this.game.currentWave++;
        this.game.waveInProgress = true;
        this.spawnInterval = waveConfig.interval;
        
        for (let i = 0; i < waveConfig.count; i++) {
            this.spawnQueue.push({
                hp: waveConfig.hp,
                maxHp: waveConfig.hp,
                speed: waveConfig.speed,
                reward: waveConfig.reward
            });
        }
    }
    
    tryBuildTower(pixelX, pixelY, typeName) {
        const gridX = Math.floor(pixelX / CONFIG.TILE_SIZE);
        const gridY = Math.floor(pixelY / CONFIG.TILE_SIZE);
        const towerConfig = CONFIG.TOWERS[typeName];
        
        if (this.game.money < towerConfig.cost) return;
        
        // 檢查該位置是否已有防禦塔
        const existing = this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
        if (existing) return;
        
        // 扣款並建立塔
        this.game.money -= towerConfig.cost;
        this.game.updateUI();
        
        this.towers.push({
            gridX, gridY,
            x: gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            y: gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            ...towerConfig,
            lastShot: 0
        });
    }
    
    update(dt) {
        const now = performance.now();
        
        // 處理敵人生成
        if (this.spawnQueue.length > 0 && now - this.lastSpawnTime > this.spawnInterval) {
            const enemyData = this.spawnQueue.shift();
            this.enemies.push({
                x: this.game.path[0].x,
                y: this.game.path[0].y,
                pathIndex: 0,
                distanceTravelled: 0,
                ...enemyData
            });
            this.lastSpawnTime = now;
        }
        
        // 更新敵人位置
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const targetPoint = this.game.path[enemy.pathIndex + 1];
            
            if (!targetPoint) {
                // 敵人抵達終點，扣玩家生命
                this.enemies.splice(i, 1);
                this.game.lives--;
                this.game.updateUI();
                if (this.game.lives <= 0) {
                    alert('遊戲結束！再接再厲！');
                    location.reload();
                }
                continue;
            }
            
            const dx = targetPoint.x - enemy.x;
            const dy = targetPoint.y - enemy.y;
            const dist = Math.hypot(dx, dy);
            const moveDist = enemy.speed * (dt * 60);
            
            if (dist <= moveDist) {
                enemy.x = targetPoint.x;
                enemy.y = targetPoint.y;
                enemy.pathIndex++;
            } else {
                enemy.x += (dx / dist) * moveDist;
                enemy.y += (dy / dist) * moveDist;
            }
        }
        
        // 檢查波次是否結束
        if (this.spawnQueue.length === 0 && this.enemies.length === 0 && this.game.waveInProgress) {
            this.game.waveInProgress = false;
            if (this.game.currentWave >= CONFIG.WAVES.length) {
                alert('恭喜通關所有波次！太神啦！');
            }
        }
        
        // 防禦塔攻擊邏輯
        this.towers.forEach(tower => {
            if (now - tower.lastShot > tower.fireRate) {
                // 尋找射程內第一個敵人
                const target = this.enemies.find(e => Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range);
                if (target) {
                    this.projectiles.push({
                        x: tower.x, y: tower.y,
                        target: target,
                        damage: tower.damage,
                        speed: 6,
                        splashRadius: tower.splashRadius || 0
                    });
                    tower.lastShot = now;
                }
            }
        });
        
        // 子彈移動與命中判定
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist <= p.speed) {
                // 命中目標
                if (p.splashRadius > 0) {
                    // 範圍傷害
                    this.enemies.forEach(e => {
                        if (Math.hypot(e.x - p.target.x, e.y - p.target.y) <= p.splashRadius) {
                            e.hp -= p.damage;
                        }
                    });
                } else {
                    p.target.hp -= p.damage;
                }
                
                this.projectiles.splice(i, 1);
            } else {
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
            }
        }
        
        // 清理死亡敵人並發放獎勵金錢
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].hp <= 0) {
                this.game.money += this.enemies[i].reward;
                this.game.updateUI();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    render() {
        const ctx = this.game.ctx;
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // 1. 繪製地圖網格與路徑
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                ctx.strokeRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
        
        // 繪製路徑線條
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        this.game.path.forEach((p, index) => {
            if (index === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        // 2. 繪製防禦塔
        this.towers.forEach(t => {
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        });
        
        // 3. 繪製敵人
        this.enemies.forEach(e => {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // 血條
            ctx.fillStyle = '#333';
            ctx.fillRect(e.x - 14, e.y - 20, 28, 4);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(e.x - 14, e.y - 20, 28 * (e.hp / e.maxHp), 4);
        });
        
        // 4. 繪製子彈
        ctx.fillStyle = '#f1c40f';
        this.projectiles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
