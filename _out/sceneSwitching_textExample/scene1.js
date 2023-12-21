import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var textMesh;

function scene1(sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene1Start(sceneProperties);
	else
		scene1Animate(sceneProperties);
}

function scene1Start(sceneProperties)
{
	const textGeometry = new TextGeometry('Resting!', {
		font: sceneProperties.font,
		size: 10,
		height: 1
	});
	const material = new THREE.MeshBasicMaterial({color: 0xff0000});
	textMesh = new THREE.Mesh(textGeometry, material);
	textMesh.rotation.x = 1;
	sceneProperties.scene.add(textMesh);
	sceneProperties.camera.position.z = 100;
	sceneProperties.sceneStarted = true;
}

function scene1Animate(sceneProperties)
{
	textMesh.rotation.x -= 0.01;
	if (textMesh.rotation.x < 0)
		scene1End(sceneProperties);
}

function scene1End(sceneProperties)
{
	sceneProperties.scene.remove(textMesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum--;
}

export {scene1};