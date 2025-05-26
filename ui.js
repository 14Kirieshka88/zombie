// js/ui.js
export const uiElements = {
    mainMenu: document.getElementById('main-menu'),
    gameOverScreen: document.getElementById('game-over-screen'),
    gameOverMessage: document.getElementById('game-over-message'),
    restartButton: document.getElementById('restart-button'),
    hpBarContainer: document.getElementById('hp-bar-container'),
    fortressHpBar: document.getElementById('fortress-hp-bar'),
    sniperHpBar: document.getElementById('sniper-hp-bar'),
    respawnTimerDisplay: document.getElementById('respawn-timer'),
    gameTimerDisplay: document.getElementById('game-timer'),
    roundInfoDisplay: document.getElementById('round-info'),
    achievementDisplay: document.getElementById('achievement-display'),
    crosshair: document.getElementById('crosshair'),
    inventoryDisplay: document.getElementById('inventory-display'),
    inventoryList: document.getElementById('inventory-list')
};

export function updateFortressHP(currentHP, maxHP) {
    uiElements.fortressHpBar.style.width = `${(currentHP / maxHP) * 100}%`;
}

export function updateSniperHP(currentHP, maxHP) {
    uiElements.sniperHpBar.style.width = `${(currentHP / maxHP) * 100}%`;
}

export function updateGameTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    uiElements.gameTimerDisplay.textContent = `Время: ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function updateRoundInfo(round, roundTime) {
    const minutes = Math.floor(roundTime / 60);
    const seconds = Math.floor(roundTime % 60);
    uiElements.roundInfoDisplay.textContent = `Раунд: ${round} (Время: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
}

export function updateInventoryDisplay(inventoryMap) {
    uiElements.inventoryList.innerHTML = '';
    if (inventoryMap.size === 0) {
        uiElements.inventoryList.innerHTML = '<li>Пусто</li>';
    } else {
        inventoryMap.forEach((count, item) => {
            const li = document.createElement('li');
            li.textContent = `${item}: ${count}`;
            uiElements.inventoryList.appendChild(li);
        });
    }
}

export function showAchievement(text) {
    uiElements.achievementDisplay.textContent = text;
    uiElements.achievementDisplay.style.display = 'block';
    setTimeout(() => {
        uiElements.achievementDisplay.style.display = 'none';
    }, 5000);
}

export function showMenu() {
    uiElements.mainMenu.style.display = 'flex';
    uiElements.gameOverScreen.style.display = 'none';
    hideGameUI();
}

export function hideMenu() {
    uiElements.mainMenu.style.display = 'none';
}

export function showGameOver(message) {
    uiElements.gameOverScreen.style.display = 'flex';
    uiElements.gameOverMessage.textContent = message;
    hideGameUI();
}

export function hideGameOver() {
    uiElements.gameOverScreen.style.display = 'none';
}

export function showGameUI(isEndlessMode) {
    uiElements.hpBarContainer.style.display = 'block';
    uiElements.sniperHpBar.parentNode.style.display = 'block';
    uiElements.gameTimerDisplay.style.display = 'block';
    uiElements.inventoryDisplay.style.display = 'block';
    uiElements.crosshair.style.display = 'block';
    if (isEndlessMode) {
        uiElements.gameTimerDisplay.style.display = 'none'; // Скрываем общий таймер в бесконечном режиме
        uiElements.roundInfoDisplay.style.display = 'block';
    } else {
        uiElements.roundInfoDisplay.style.display = 'none';
    }
}

export function hideGameUI() {
    uiElements.hpBarContainer.style.display = 'none';
    uiElements.sniperHpBar.parentNode.style.display = 'none';
    uiElements.gameTimerDisplay.style.display = 'none';
    uiElements.roundInfoDisplay.style.display = 'none';
    uiElements.crosshair.style.display = 'none';
    uiElements.inventoryDisplay.style.display = 'none';
    uiElements.respawnTimerDisplay.style.display = 'none';
}

export function showRespawnTimer(time) {
    uiElements.respawnTimerDisplay.textContent = time;
    uiElements.respawnTimerDisplay.style.display = 'block';
}

export function hideRespawnTimer() {
    uiElements.respawnTimerDisplay.style.display = 'none';
}