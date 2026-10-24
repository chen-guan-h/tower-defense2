import { CONFIG } from './config.js';
import { GameEngine } from './managers/GameEngine.js';

class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            // 如果 HTML 還沒 canvas，自動建立一個
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'gameCanvas';
            this.canvas.width = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
            this.canvas.height = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲狀態
        this.money = CONFIG.STARTING_MONEY;
        this.lives = CONFIG.STARTING_LIVES;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;
        
        // 玩家目前選中的要建造的塔類型
        this.selectedTowerType = 'basic';
        
        // 敵人行進路徑點 (依格子座標計算像素)
        this.path = [
            { x: 0, y: 2 },
            { x: 5, y: 2 },
            { x: 5, y: 7 },
            { x: 10, y: 7 },
            { x: 10, y: 3 },
            { x: 14, y: 3 }
        ].map(p => ({ x: p.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, y: p.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 }));
        
        this.engine = new GameEngine(this);
        this.initUI();
        this.engine.start();
    }
    
    initUI() {
        // 建立簡單的控制介面與按鈕
        const uiContainer = document.createElement('div');
        uiContainer.style.cssText = 'margin-top: 10px; font-family: sans-serif; text-align: center;';
        uiContainer.innerHTML = `
            <div id="stats" style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
                金錢: <span id="money">${this.money}</span> | 生命: <span id="lives">${this.lives}</span> | 波次: <span id="wave">${this.currentWave}/${CONFIG.WAVES.length}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <button class="tower-btn" data-type="basic" style="background:#3498db; color:white; padding:6px 12px; margin:2px; border:none; border-radius:4px;">基礎砲塔 ($50)</button>
                <button class="tower-btn" data-type="sniper" style="background:#e74c3c; color:white; padding:6px 12px; margin:2px; border:none; border-radius:4px;">狙擊塔 ($100)</button>
                <button class="tower-btn" data-type="splash" style="background:#f1c40f; color:#333; padding:6px 12px; margin:2px; border:none; border-radius:4px;">範圍塔 ($120)</button>
            </div>
            <button id="startWaveBtn" style="background:#2ecc71; color:white; padding:10px 20px; font-size:16px; border:none; border-radius:6px; font-weight:bold;">開始下一波</button>
        `;
        document.body.appendChild(uiContainer);
        
        // 綁定按鈕事件
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedTowerType = e.target.getAttribute('data-type');
                document.querySelectorAll('.tower-btn').forEach(b => b.style.outline = 'none');
                e.target.style.outline = '3px solid #fff';
            });
        });
        
        document.getElementById('startWaveBtn').addEventListener('click', () => {
            this.engine.startNextWave();
        });
        
        // 畫布點擊事件：建造防禦塔
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.engine.tryBuildTower(x, y, this.selectedTowerType);
        });
    }
    
    updateUI() {
        document.getElementById('money').innerText = this.money;
        document.getElementById('lives').innerText = this.lives;
        document.getElementById('wave').innerText = `${this.currentWave}/${CONFIG.WAVES.length}`;
    }
}

window.onload = () => {
    new TowerDefenseGame();
};
