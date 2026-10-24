// js/managers/GameEngine.js (遊戲引擎與主迴圈模組)

export class GameEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isRunning = false;
        
        // 測試用的小方塊初始位置
        this.boxX = 50;
        this.boxY = 50;
        this.speed = 2;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    // 主迴圈
    loop = () => {
        if (!this.isRunning) return;

        this.update();
        this.render();

        // 依靠瀏覽器每秒更新 60 次
        requestAnimationFrame(this.loop);
    }

    // 更新邏輯（讓方塊往右移動測試動畫）
    update() {
        this.boxX += this.speed;
        // 如果碰到右邊界就彈回來
        if (this.boxX > this.canvas.width - 80 || this.boxX < 0) {
            this.speed = -this.speed;
        }
    }

    // 渲染畫面
    render() {
        // 1. 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. 畫出移動中的方塊
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.boxX, this.boxY, 80, 80);
    }
}
