import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var cube;

function scene2(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene2Start(sceneProperties);
	else
		scene2Animate(sceneProperties);
}

function scene2Start(sceneProperties) {
    console.log("here");
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    cube = new THREE.Mesh(geometry, material);
    sceneProperties.camera.position.z = 5;
    sceneProperties.scene.add(cube);
    sceneProperties.sceneStarted = true;
}

function scene2Animate(sceneProperties) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

export {scene2};