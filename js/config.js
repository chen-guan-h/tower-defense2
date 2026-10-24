export const CONFIG = {
    TILE_SIZE: 40,
    MAP_WIDTH: 15,
    MAP_HEIGHT: 10,
    STARTING_MONEY: 150,
    STARTING_LIVES: 10,
    
    // 防禦塔設定 (可建造多種不同特性的塔)
    TOWERS: {
        basic: { name: '基礎砲塔', cost: 50, range: 120, damage: 15, fireRate: 600, color: '#3498db' },
        sniper: { name: '狙擊塔', cost: 100, range: 220, damage: 45, fireRate: 1400, color: '#e74c3c' },
        splash: { name: '範圍砲塔', cost: 120, range: 90, damage: 25, fireRate: 900, color: '#f1c40f', splashRadius: 60 }
    },
    
    // 敵人波次設定
    WAVES: [
        { count: 8, speed: 1.2, hp: 60, reward: 15, interval: 1200 },
        { count: 12, speed: 1.5, hp: 100, reward: 20, interval: 1000 },
        { count: 15, speed: 1.8, hp: 150, reward: 25, interval: 800 },
        { count: 20, speed: 2.2, hp: 250, reward: 35, interval: 600 }
    ]
};
