import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var shotNum = 0
var frameCounter = 0;
var p1Mesh, vsMesh, p2Mesh;

function scene0(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene0Start(sceneProperties);
	else
		scene0Animate(sceneProperties);
}

function scene0Start(sceneProperties) {
	const textSize = 0.5;
	const textHeight = 0.3;
	const p1Geom = new TextGeometry('Player 1', {font: sceneProperties.font, size: textSize, height: textHeight});
	const vsGeom = new TextGeometry('vs', {font: sceneProperties.font, size: textSize, height: textHeight});
	const p2Geom = new TextGeometry('Player 2', {font: sceneProperties.font, size: textSize, height: textHeight});
	const p1Material = new THREE.MeshBasicMaterial({color: 0xff0000});
	const vsMaterial = new THREE.MeshBasicMaterial({color: 0xffffaa});
	const p2Material = new THREE.MeshBasicMaterial({color: 0x0000ff});
	p1Mesh = new THREE.Mesh(p1Geom, p1Material);
	vsMesh = new THREE.Mesh(vsGeom, vsMaterial);
	p2Mesh = new THREE.Mesh(p2Geom, p2Material);
	sceneProperties.camera.position.z = 5;
	p1Mesh.position.x -= 11; // start x
	p1Mesh.position.y += 1;
	sceneProperties.scene.add(p1Mesh);  
	sceneProperties.sceneStarted = true;
}

function scene0Animate(sceneProperties) {
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
		case 3:
			shot3(sceneProperties);
			break;								
	}
}

function shot0(sceneProperties) {
	if(p1Mesh.position.x < -3) // end x
		p1Mesh.position.x += 0.3; // speed
	else
	{
		vsMesh.position.z -= 10; // start z
		sceneProperties.scene.add(vsMesh);
		shotNum++;
	}
}

function shot1(sceneProperties) {
	if(vsMesh.position.z < 0) // end z
		vsMesh.position.z += 0.4; // speed
	else {
		p2Mesh.position.x += 9; // start x
		p2Mesh.position.y -= 1;
		sceneProperties.scene.add(p2Mesh);
		shotNum++;
	}
}

function shot2() {
	if(p2Mesh.position.x > 1) // end x
		p2Mesh.position.x -= 0.3; // speed
	else
		shotNum++;
}

function shot3(sceneProperties) {
	if (frameCounter < 70)
		frameCounter++;
	else
		scene0End(sceneProperties);
}

function scene0End(sceneProperties) {
	sceneProperties.scene.remove(p1Mesh);
	sceneProperties.scene.remove(vsMesh);
	sceneProperties.scene.remove(p2Mesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene0};