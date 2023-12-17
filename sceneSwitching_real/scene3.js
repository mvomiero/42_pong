import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var shotNum = 0;
var frameCounter = 0;
var playerMesh, winsMesh;

function scene3(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene3Start(sceneProperties);
	else
		scene3Animate(sceneProperties);
}

function scene3Start(sceneProperties) {
	const textSize = 0.5;
	const textHeight = 0.3;
	const playerGeom = new TextGeometry('Player 1', {font: sceneProperties.font, size: textSize, height: textHeight});
	const winsGeom = new TextGeometry('Wins!', {font: sceneProperties.font, size: textSize, height: textHeight});    
	const playerMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
	const winsMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
	playerMesh = new THREE.Mesh(playerGeom, playerMaterial);
	winsMesh = new THREE.Mesh(winsGeom, winsMaterial);
	sceneProperties.camera.position.z = 5;
	playerMesh.position.x -= 11; // start x
	playerMesh.position.y += 0.5;
	sceneProperties.scene.add(playerMesh);
	sceneProperties.sceneStarted = true;
}

function scene3Animate(sceneProperties) {
	switch(shotNum)
	{
		case 0:
			shot0(sceneProperties);
			break;
		case 1:
			shot1(sceneProperties);
			break;
		case 2:
			shot2(sceneProperties);
			break;							
	}
}

function shot0(sceneProperties) {
	if(playerMesh.position.x < -3) // end x
		playerMesh.position.x += 0.3; // speed
	else {
		winsMesh.position.x += 9; // start x
		winsMesh.position.y -= 0.5;
		sceneProperties.scene.add(winsMesh);
		shotNum++;
	}
}

function shot1(sceneProperties) {
	if(winsMesh.position.x > 0.3) // end x
		winsMesh.position.x -= 0.3; // speed
	else
		shotNum++;
}

function shot2(sceneProperties) {
	if (frameCounter < 70)
		frameCounter++;
	else {
		scene3End(sceneProperties);
	}
}

function scene3End(sceneProperties) {
	sceneProperties.scene.remove(playerMesh);
	sceneProperties.scene.remove(winsMesh); 
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene3};