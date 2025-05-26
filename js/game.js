// js/game.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.164.1/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/PointerLockControls.js';

import {
    GAME_MODES, SNIPER_HEADSHOT_DAMAGE, SNIPER_BODY_DAMAGE, RESPAWN_TIME,
    ZOMBIE_RAIN_DAMAGE_PER_SEC, ENEMY_TYPES, ENEMY_SPAWN_CHANCES
} from './config.js';
import {
    updateFortressHP, updateSniperHP, updateGameTimer, updateRoundInfo,
    updateInventoryDisplay, showAchievement, showMenu, showGameOver,
    hideGameUI, showGameUI, showRespawnTimer, hideRespawnTimer, uiElements
} from './ui.js';
import { playShootSound, playHitSound } from './audio.js';
import { createFortress, createRoad, createSniperRifle, createEnemyMesh } from './entities.js';

// --- Game State & Core Variables ---
export let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
export let currentModeSettings = null;
export let gameTimeRemaining = 0;
export let currentRound = 1;

let FORTRESS_MAX_HP;
let fortressHP;
let SNIPER_MAX_HP;
let sniperHP;

export let isSniperDead = false;
let respawnCountdown = 0;
let respawnIntervalId = null;

let zombieRainActive = false;
let zombieRainIntervalId = null;

export const inventory = new Map(); // Для хранения дропа

// --- Three.js Scene Elements ---
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let renderer; // Будет инициализирован в main.js
export let controls; // Будет инициализирован в main.js

const enemies = [];
const spawnPoints = [{ x: 0, y: 0.5, z: 50 }]; // Точка появления врагов

let gameTimerInterval = null;
let enemySpawnInterval = null;

// --- Initialize Scene ---
export function initScene(webglRenderer) {
    renderer = webglRenderer;
    scene.add(new THREE.AmbientLight(0x404040));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    scene.add(createRoad());
    scene.add(createFortress());
    createSniperRifle(camera);

    camera.position.set(0, 1.6, 0); // Default player height

    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    controls.addEventListener('lock', () => {
        if (gameState === 'playing') {
            showGameUI(currentModeSettings.duration === null);
        }
    });

    controls.addEventListener('unlock', () => {
        // UI elements are hidden/shown based on gameState, not just pointer lock
        // This prevents hiding UI if player simply clicks outside the window
    });
}

// --- Game Flow Functions ---
export function startGame(mode) {
    currentModeSettings = GAME_MODES[mode];
    FORTRESS_MAX_HP = currentModeSettings.fortressHP;
    SNIPER_MAX_HP = currentModeSettings.sniperHP;

    fortressHP = FORTRESS_MAX_HP;
    sniperHP = SNIPER_MAX_HP;
    inventory.clear();
    updateInventoryDisplay(inventory);
    isSniperDead = false;
    zombieRainActive = false;
    if (zombieRainIntervalId) clearInterval(zombieRainIntervalId);
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);

    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;

    hideMenu();
    showGameUI(currentModeSettings.duration === null); // Передаем, является ли режим бесконечным
    gameState = 'playing';

    updateFortressHP(fortressHP, FORTRESS_MAX_HP);
    updateSniperHP(sniperHP, SNIPER_MAX_HP);

    if (currentModeSettings.duration !== null) {
        gameTimeRemaining = currentModeSettings.duration;
        updateGameTimer(gameTimeRemaining);
        gameTimerInterval = setInterval(() => {
            gameTimeRemaining--;
            updateGameTimer(gameTimeRemaining);
            if (gameTimeRemaining <= 0) {
                clearInterval(gameTimerInterval);
                endGame('Вы успешно защитили крепость!');
            }
        }, 1000);
    } else { // Endless mode
        currentRound = 1;
        gameTimeRemaining = currentModeSettings.roundTime; // Initial round time
        startRoundTimer();
    }

    enemySpawnInterval = setInterval(spawnRandomEnemy, currentModeSettings.spawnRate);

    controls.lock(); // Lock pointer to start game
}

export function endGame(message) {
    gameState = 'gameOver';
    controls.unlock();
    clearInterval(gameTimerInterval);
    clearInterval(enemySpawnInterval);
    if (respawnIntervalId) clearInterval(respawnIntervalId);
    if (zombieRainIntervalId) clearInterval(zombieRainIntervalId);

    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;

    showGameOver(message);
    hideGameUI();
}

export function resetGame() {
    showMenu();
    gameState = 'menu';
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, 0, 0);
}

function startRoundTimer() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    updateRoundInfo(currentRound, gameTimeRemaining);
    gameTimerInterval = setInterval(() => {
        gameTimeRemaining--;
        updateRoundInfo(currentRound, gameTimeRemaining);
        if (gameTimeRemaining <= 0) {
            clearInterval(gameTimerInterval);
            startNextRound();
        }
    }, 1000);
}

function startNextRound() {
    currentRound++;
    // Calculate next round time, capping at maxRoundTime for round 55
    if (currentRound <= 55) {
        currentModeSettings.roundTime = Math.min(
            currentModeSettings.roundTime + currentModeSettings.roundIncrement,
            currentModeSettings.maxRoundTime
        );
    }

    // Adjust difficulty for endless mode
    currentModeSettings.enemyHP_multiplier += 0.02;
    currentModeSettings.enemyDamage_multiplier += 0.02;
    currentModeSettings.spawnRate = Math.max(500, currentModeSettings.spawnRate - 50);
    currentModeSettings.bossChance += 0.005;

    gameTimeRemaining = currentModeSettings.roundTime;
    startRoundTimer();

    if (currentRound > 55) {
        showAchievement("Невозможное возможно!");
    }

    console.log(`Начался раунд ${currentRound}!`);
}

// --- Sniper Death / Respawn Logic ---
export function handleSniperDeath() {
    isSniperDead = true;
    respawnCountdown = RESPAWN_TIME;
    showRespawnTimer(respawnCountdown);
    controls.unlock();

    respawnIntervalId = setInterval(() => {
        respawnCountdown--;
        showRespawnTimer(respawnCountdown);
        if (respawnCountdown <= 0) {
            clearInterval(respawnIntervalId);
            hideRespawnTimer();
            sniperHP = SNIPER_MAX_HP;
            updateSniperHP(sniperHP, SNIPER_MAX_HP);
            isSniperDead = false;
            if (gameState === 'playing') {
                controls.lock();
            }
        }
    }, 1000);
}

// --- Enemy Spawning & Logic ---
function spawnRandomEnemy() {
    if (gameState !== 'playing' || isSniperDead) return;

    let possibleEnemies = [];
    let totalChance = 0;

    const shouldSpawnBoss = Math.random() < currentModeSettings.bossChance;

    if (shouldSpawnBoss) {
        possibleEnemies.push('босс');
        totalChance = 1;
    } else {
        for (const type in ENEMY_SPAWN_CHANCES) {
            possibleEnemies.push(type);
            totalChance += ENEMY_SPAWN_CHANCES[type];
        }
    }

    let randomValue = Math.random() * totalChance;
    let chosenType = null;

    for (const type of possibleEnemies) {
        if (type === 'босс' && shouldSpawnBoss) {
            chosenType = type;
            break;
        }
        if (type !== 'босс') { // Только если это не босс и не выбран босс
            randomValue -= ENEMY_SPAWN_CHANCES[type];
            if (randomValue <= 0) {
                chosenType = type;
                break;
            }
        }
    }

    if (chosenType) {
        const enemyTypeInfo = ENEMY_TYPES[chosenType];
        const enemyMesh = createEnemyMesh(enemyTypeInfo);

        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        enemyMesh.position.set(spawnPoint.x + (Math.random() - 0.5) * 10, enemyMesh.geometry.parameters.height / 2 || 0.5, spawnPoint.z);

        enemyMesh.userData = {
            type: chosenType,
            hp: enemyTypeInfo.hp * currentModeSettings.enemyHP_multiplier,
            maxHp: enemyTypeInfo.hp * currentModeSettings.enemyHP_multiplier,
            damage: enemyTypeInfo.damage * currentModeSettings.enemyDamage_multiplier,
            speed: enemyTypeInfo.speed * (1 + (currentRound * 0.005)),
            drop: { ...enemyTypeInfo.drop }, // Копируем дроп, чтобы не изменять оригинал
            penalty: enemyTypeInfo.penalty || 0,
            isHuman: chosenType.includes('человек'),
            isBoss: enemyTypeInfo.isBoss || false
        };

        if (enemyMesh.userData.isBoss) {
            enemyMesh.userData.hp *= currentModeSettings.bossHP_multiplier;
            enemyMesh.userData.damage *= currentModeSettings.bossDamage_multiplier;
        }

        scene.add(enemyMesh);
        enemies.push(enemyMesh);
    }
}

// --- Zombie Rain Logic ---
export function startZombieRain() {
    if (zombieRainActive) return;
    zombieRainActive = true;
    console.log('Начался зомби-дождь!');
    zombieRainIntervalId = setInterval(() => {
        fortressHP -= ZOMBIE_RAIN_DAMAGE_PER_SEC;
        updateFortressHP(fortressHP, FORTRESS_MAX_HP);
        if (fortressHP <= 0) {
            stopZombieRain();
        }
    }, 1000);
}

export function stopZombieRain() {
    if (!zombieRainActive) return;
    zombieRainActive = false;
    clearInterval(zombieRainIntervalId);
    console.log('Зомби-дождь закончился!');
}

// --- Shooting Logic ---
const raycaster = new THREE.Raycaster();
const shootDirection = new THREE.Vector3();

export function shoot() {
    playShootSound();

    camera.getWorldDirection(shootDirection);
    raycaster.set(camera.position, shootDirection);

    const intersects = raycaster.intersectObjects(enemies, true);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const enemy = hitObject.userData;

        if (enemy && enemy.hp !== undefined) {
            playHitSound();

            let damage = SNIPER_BODY_DAMAGE;
            if (intersects[0].point.y > hitObject.position.y + (hitObject.geometry.parameters.height || hitObject.geometry.parameters.radius * 2) / 4) {
                damage = SNIPER_HEADSHOT_DAMAGE;
                console.log('Хедшот!');
            }

            enemy.hp -= damage;
            console.log(`Попал по ${enemy.type}! У него осталось ${enemy.hp} HP.`);

            if (enemy.hp <= 0) {
                console.log(`${enemy.type} убит!`);
                scene.remove(hitObject);
                enemies.splice(enemies.indexOf(hitObject), 1);
                handleEnemyDeath(enemy);
            } else {
                hitObject.material.color.set(0xff0000); // Красный
                setTimeout(() => {
                    if (enemy.isBoss) {
                        hitObject.material.color.set(0x800080);
                    } else {
                        // Для обычных врагов можно установить случайный или предопределенный цвет
                        hitObject.material.color.set(0x00ff00); // Пример: зеленый
                    }
                }, 100);
            }
        }
    }
}

function handleEnemyDeath(enemy) {
    console.log('Дроп с', enemy.type, ':', enemy.drop);
    for (const item in enemy.drop) {
        let actualChance = enemy.drop[item];
        if (enemy.isBoss) {
            actualChance *= currentModeSettings.bossLoot_multiplier;
        }

        if (Math.random() < actualChance) {
            inventory.set(item, (inventory.get(item) || 0) + 1);
            console.log(`Выпал: ${item}. Инвентарь:`, inventory);
            updateInventoryDisplay(inventory);
            if (item === 'схема') {
                if (zombieRainActive) {
                    stopZombieRain();
                    console.log('Схема использована для отмены зомби-дождя!');
                    inventory.set(item, (inventory.get(item) || 1) - 1);
                    if (inventory.get(item) <= 0) inventory.delete(item);
                    updateInventoryDisplay(inventory);
                } else {
                    console.log('Схема найдена, но зомби-дождя нет.');
                }
            }
        }
    }

    if (enemy.isHuman && enemy.penalty > 0) {
        fortressHP -= enemy.penalty;
        updateFortressHP(fortressHP, FORTRESS_MAX_HP);
        console.log(`Убили человека! Крепость потеряла ${enemy.penalty} HP.`);
        if (Math.random() < 0.3) {
            startZombieRain();
        }
    }
}

export function updateGameLogic() {
    if (gameState !== 'playing' || isSniperDead) return;

    enemies.forEach(enemy => {
        if (enemy.userData && enemy.userData.speed) {
            const fortressMesh = scene.children.find(obj => obj.geometry instanceof THREE.BoxGeometry && obj.position.z === -45); // Находим крепость
            if (fortressMesh) {
                const targetZ = fortressMesh.position.z + fortressMesh.geometry.parameters.depth / 2;
                if (enemy.position.z > targetZ + (enemy.geometry.parameters.depth || enemy.geometry.parameters.radius * 2 || 0) / 2) {
                    enemy.position.z -= enemy.userData.speed;
                } else {
                    // Враг достиг крепости
                    if (enemy.userData.damage > 0) {
                        fortressHP -= enemy.userData.damage;
                        updateFortressHP(fortressHP, FORTRESS_MAX_HP);
                        console.log(`${enemy.type} атаковал крепость! Крепость потеряла ${enemy.userData.damage} HP.`);
                    }
                    scene.remove(enemy);
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
            }
        }
    });
}

// Accessors for external use (e.g., UI)
export function getFortressHP() { return fortressHP; }
export function getFortressMaxHP() { return FORTRESS_MAX_HP; }
export function getSniperHP() { return sniperHP; }
export function getSniperMaxHP() { return SNIPER_MAX_HP; }
export function getCurrentRound() { return currentRound; }
export function getGameTimeRemaining() { return gameTimeRemaining; }
export function getInventory() { return inventory; }
export function getControls() { return controls; }
export function getCamera() { return camera; }
export function getScene() { return scene; }
