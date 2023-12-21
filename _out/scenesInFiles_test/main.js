// main.js

import * as THREE from 'three';
import { scene0Animate } from './scene0.js';
import { scene1Animate } from './scene1.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
var sceneNum = 0;
var sceneInProgress = false;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    switch (sceneNum) {
        case 0:
            sceneInProgress = scene0Animate(scene, sceneInProgress);
            if (sceneInProgress === false)
                sceneNum++;
            break;
        case 1:
            sceneInProgress = scene1Animate(scene, sceneInProgress);
            if (sceneInProgress === false)
                sceneNum++;
            break;            
    }
}

animate();