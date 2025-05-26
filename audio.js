// js/audio.js
const shootSound = new Audio('https://www.soundjay.com/weapons/sounds/rifle-shot-1.mp3');
const hitSound = new Audio('https://www.soundjay.com/hits/sounds/hit-1.mp3');

shootSound.volume = 0.5;
hitSound.volume = 0.3;

export function playShootSound() {
    shootSound.currentTime = 0;
    shootSound.play().catch(e => console.error("Ошибка при воспроизведении звука выстрела:", e));
}

export function playHitSound() {
    hitSound.currentTime = 0;
    hitSound.play().catch(e => console.error("Ошибка при воспроизведении звука попадания:", e));
}