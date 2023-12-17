// main.js

import * as THREE from 'three';
import { scene0Animate } from './scene0.js';

async function loadFont() {
    const fontLoader = new FontLoader();

    return new Promise((resolve, reject) => {
        fontLoader.load('https://unpkg.com/three@0.138.3/examples/fonts/droid/droid_serif_regular.typeface.json', (font) => {
            resolve(font);
        }, undefined, reject);
    });
}

async function init() {
    try {
        const font = await loadFont();
        // The rest of your program here, using the loaded font
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const p1Geom = new TextGeometry('Player 1', {font: font, size: textSize, height: textHeight});
        const vsGeom = new TextGeometry('vs', {font: font, size: textSize, height: textHeight});
        const p2Geom = new TextGeometry('Player 2', {font: font, size: textSize, height: textHeight});

        camera.position.z = 5;

        var sceneProperties = {
            scene: scene,
            sceneNum: 0,
            shotNum: 0,
            frameCounter: 0,
            sceneInProgress: false
        };
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            switch (sceneProperties.sceneNum) {
                case 0:
                    scene0Animate(sceneProperties);
                    break;           
            }
        }
        animate();        
    } catch (error) {
        console.error('Error loading font:', error);
    }
}

init();