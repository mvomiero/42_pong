// scene0.js

import * as THREE from 'three';

const ballGeo = new THREE.SphereGeometry(0.5, 5, 5);
const ballMat = new THREE.LineBasicMaterial({ color: 0xffffff });
const ball = new THREE.LineSegments(ballGeo, ballMat);

function scene0Animate(scene, sceneInProgress) {
    if (sceneInProgress === false) {
        scene.add(ball);
        return true;
    } else {
        if (ball.position.y > 2) {
            scene.remove(ball);
            return false;
        } else {
            ball.position.y += 0.05;
        }
    }
}

export { scene0Animate };
