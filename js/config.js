// js/config.js
export const GAME_MODES = {
    easy: {
        duration: 4 * 60, // seconds
        fortressHP: 250,
        sniperHP: 150, // More HP for easy
        enemyHP_multiplier: 0.8,
        enemyDamage_multiplier: 0.7,
        spawnRate: 4000, // slower spawn
        bossChance: 0.01,
        bossHP_multiplier: 0.5,
        bossLoot_multiplier: 1.5,
        bossDamage_multiplier: 0.5
    },
    normal: {
        duration: 6 * 60,
        fortressHP: 250,
        sniperHP: 100,
        enemyHP_multiplier: 1,
        enemyDamage_multiplier: 1,
        spawnRate: 3000, // standard spawn
        bossChance: 0.03,
        bossHP_multiplier: 1,
        bossLoot_multiplier: 1,
        bossDamage_multiplier: 1
    },
    hard: {
        duration: 10 * 60,
        fortressHP: 250,
        sniperHP: 75, // Less HP for hard
        enemyHP_multiplier: 1.2,
        enemyDamage_multiplier: 1.3,
        spawnRate: 2000, // faster spawn
        bossChance: 0.08,
        bossHP_multiplier: 1.5,
        bossLoot_multiplier: 0.7,
        bossDamage_multiplier: 1.5
    },
    endless: {
        duration: null, // Managed by rounds
        fortressHP: 250,
        sniperHP: 100,
        enemyHP_multiplier: 1,
        enemyDamage_multiplier: 1,
        spawnRate: 3000,
        bossChance: 0.05,
        bossHP_multiplier: 1,
        bossLoot_multiplier: 1,
        bossDamage_multiplier: 1,
        roundTime: 2 * 60, // initial round time
        roundIncrement: 10, // seconds added per round
        maxRoundTime: 20 * 60 // 20 minutes for round 55
    }
};

export const SNIPER_HEADSHOT_DAMAGE = 100;
export const SNIPER_BODY_DAMAGE = 60;
export const RESPAWN_TIME = 10; // Секунды
export const ZOMBIE_RAIN_DAMAGE_PER_SEC = 5;

export const ENEMY_TYPES = {
    'обычный зомби': { hp: 80, damage: 10, speed: 0.05, model: 'cube', drop: { 'гнилая плоть': 1 } },
    'быстрый зомби': { hp: 40, damage: 5, speed: 0.1, model: 'sphere', drop: { 'гнилая плоть': 0.8 } },
    'зомби ученый': { hp: 90, damage: 12, speed: 0.04, model: 'capsule', drop: { 'гнилая плоть': 0.7, 'схема': 0.1 } },
    'зомби длинный': { hp: 120, damage: 15, speed: 0.03, model: 'cylinder', drop: { 'гнилая плоть': 1.2 } },
    'зомби скелет': { hp: 100, damage: 10, speed: 0.05, model: 'cone', drop: { 'кости': 1, 'зачарованные кости': 0.05 } },
    'обычный человек': { hp: 80, damage: 0, speed: 0.06, model: 'cube', drop: {}, penalty: 10 },
    'ученый человек': { hp: 90, damage: 0, speed: 0.05, model: 'capsule', drop: {}, penalty: 10 },
    'быстрый человек': { hp: 60, damage: 0, speed: 0.08, model: 'sphere', drop: {}, penalty: 10 },
    'босс': { hp: 500, damage: 50, speed: 0.02, model: 'wither', drop: { 'редкий лут': 1 }, isBoss: true } // Пример босса
};

export const ENEMY_SPAWN_CHANCES = {
    'обычный зомби': 0.60,
    'длинный зомби': 0.10,
    'быстрый зомби': 0.20,
    'зомби ученый': 0.06,
    'зомби скелет': 0.12,
    'обычный человек': 0.48,
    'ученый человек': 0.05,
    'быстрый человек': 0.20
};
