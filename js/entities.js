// js/entities.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.164.1/three.module.js';

export function createFortress() {
    const fortressGeometry = new THREE.BoxGeometry(20, 10, 5);
    const fortressMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const fortress = new THREE.Mesh(fortressGeometry, fortressMaterial);
    fortress.position.y = 5;
    fortress.position.z = -45;
    return fortress;
}

export function createRoad() {
    const roadGeometry = new THREE.BoxGeometry(10, 100, 0.1);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.y = 0.05;
    road.position.z = -30;
    return road;
}

export function createSniperRifle(camera) {
    const sniperRifleGeometry = new THREE.BoxGeometry(0.1, 0.1, 1);
    const sniperRifleMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const sniperRifle = new THREE.Mesh(sniperRifleGeometry, sniperRifleMaterial);
    sniperRifle.position.set(0.5, -0.3, -1);
    camera.add(sniperRifle); // Прикрепляем к камере
    return sniperRifle;
}

export function createEnemyMesh(enemyTypeInfo) {
    let geometry;
    switch (enemyTypeInfo.model) {
        case 'cube': geometry = new THREE.BoxGeometry(1, 1, 1); break;
        case 'sphere': geometry = new THREE.SphereGeometry(0.5, 16, 16); break;
        case 'capsule': geometry = new THREE.CapsuleGeometry(0.5, 1, 8); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16); break;
        case 'cone': geometry = new THREE.ConeGeometry(0.5, 1, 16); break;
        case 'wither': geometry = new THREE.BoxGeometry(3, 3, 3); break; // Большой куб для босса
        default: geometry = new THREE.BoxGeometry(1, 1, 1); break;
    }
    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }); // Случайный цвет
    const enemyMesh = new THREE.Mesh(geometry, material);

    if (enemyTypeInfo.isBoss) {
        enemyMesh.material.color.set(0x800080); // Цвет босса - фиолетовый
        enemyMesh.scale.set(1.5, 1.5, 1.5); // Увеличим размер босса
    }

    return enemyMesh;
}
