// js/main.js (遊戲進入點模組)
import { CONFIG } from './config.js';
import { GameEngine } from './managers/GameEngine.js';

console.log("主程式模組載入成功！");

// 取得畫布
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 套用設定
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// 初始化遊戲引擎並啟動
const engine = new GameEngine(canvas, ctx);
engine.start();
