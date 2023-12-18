import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var shotNum = 0;
var count3Mesh, count2Mesh, count1Mesh, beginMesh;

function scene1(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene1Start(sceneProperties);
	else
		scene1Animate(sceneProperties);
}

function scene1Start(sceneProperties) {
	const textSize = 0.5;
	const textHeight = 0.3;
	const count3Geom = new TextGeometry('3', {font: sceneProperties.font, size: textSize, height: textHeight});
	const count2Geom = new TextGeometry('2', {font: sceneProperties.font, size: textSize, height: textHeight});
	const count1Geom = new TextGeometry('1', {font: sceneProperties.font, size: textSize, height: textHeight});
	const beginGeom = new TextGeometry('GO!', {font: sceneProperties.font, size: textSize, height: textHeight});
	const count3Material = new THREE.MeshBasicMaterial({color: sceneProperties.p1Colour});
	const count2Material = new THREE.MeshBasicMaterial({color: sceneProperties.otherTextColour});
	const count1Material = new THREE.MeshBasicMaterial({color: sceneProperties.p2Colour});
	const beginMaterial = new THREE.MeshBasicMaterial({color: sceneProperties.otherTextColour});
	count3Mesh = new THREE.Mesh(count3Geom, count3Material);
	count2Mesh = new THREE.Mesh(count2Geom, count2Material);
	count1Mesh = new THREE.Mesh(count1Geom, count1Material);
	beginMesh = new THREE.Mesh(beginGeom, beginMaterial);
	sceneProperties.camera.position.x += 0.15;
	sceneProperties.camera.position.y += 0.25;
	sceneProperties.camera.position.z = 5;
	count3Mesh.position.z = -20; // start z
	sceneProperties.scene.add(count3Mesh);  
	sceneProperties.sceneStarted = true;
}

function scene1Animate(sceneProperties) {
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
	if(count3Mesh.position.z < 10) // end z
		count3Mesh.position.z += 0.3; // speed
	else {
		count2Mesh.position.z = -20; // start z
		sceneProperties.scene.remove(count3Mesh);
		sceneProperties.scene.add(count2Mesh);
		shotNum++;
	}
}

function shot1(sceneProperties) {
	if(count2Mesh.position.z < 10) // end z
		count2Mesh.position.z += 0.3; // speed
	else {
		count1Mesh.position.z = -20; // start z
		sceneProperties.scene.remove(count2Mesh);
		sceneProperties.scene.add(count1Mesh);
		shotNum++;
	}
}

function shot2(sceneProperties) {
	if(count1Mesh.position.z < 10) // end z
		count1Mesh.position.z += 0.3; // speed
	else {
		beginMesh.position.z = -20; // start z
		sceneProperties.scene.remove(count1Mesh);
		sceneProperties.scene.add(beginMesh);
		shotNum++;
	}
}

function shot3(sceneProperties) {
	if(beginMesh.position.z < 5) // end z
		beginMesh.position.z += 0.3; // speed
	else {
		scene1End(sceneProperties);
	}
}

function scene1End(sceneProperties) {
	sceneProperties.scene.remove(beginMesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene1};