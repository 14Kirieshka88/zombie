// js/main.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.164.1/three.module.js'; // ДОБАВЛЕНА/ПРОВЕРЕНА ЭТА СТРОКА
import {
    initScene, startGame, resetGame, shoot, updateGameLogic,
    gameState, getControls, getCamera, getScene, isSniperDead // Добавили isSniperDead сюда
} from './game.js';
import { uiElements, showMenu, hideGameUI } from './ui.js';

// --- Global Three.js Setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize game scene and controls
initScene(renderer);

// --- Game Loop ---
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);

    if (lastTime === 0) lastTime = time;
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (gameState === 'playing') {
        // Update camera FOV for aiming
        const camera = getCamera();
        const normalFOV = 75;
        const aimedFOV = 25;
        const aimSpeed = 0.1;
        // Используем глобальную переменную isAimingGlobal, которая управляется событиями мыши в main.js
        if (isAimingGlobal) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, aimedFOV, aimSpeed);
        } else {
            camera.fov = THREE.MathUtils.lerp(camera.fov, normalFOV, aimSpeed);
        }
        camera.updateProjectionMatrix();

        updateGameLogic(); // Update enemy movement, etc.
    }

    renderer.render(getScene(), getCamera());
}

// --- Event Listeners (Global) ---
window.addEventListener('resize', () => {
    const camera = getCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main Menu Button Listeners
uiElements.mainMenu.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (event) => {
        startGame(event.target.dataset.mode);
    });
});

// Restart Button Listener
uiElements.restartButton.addEventListener('click', resetGame);

// Shooting (LMB)
document.addEventListener('click', (event) => {
    const controls = getControls();
    // Используем isSniperDead, импортированную из game.js
    if (gameState === 'playing' && event.button === 0 && !isSniperDead && controls.isLocked) {
        shoot();
    }
});

// Aiming (RMB) - Эта переменная должна быть здесь, так как она управляется событиями мыши в main.js
let isAimingGlobal = false;

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (gameState === 'playing' && !isSniperDead && getControls().isLocked) {
        isAimingGlobal = true;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 2) {
        isAimingGlobal = false;
    }
});


// Initial setup on load
showMenu(); // Show main menu initially
hideGameUI(); // Hide in-game UI

animate();
