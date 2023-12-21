import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var textMesh;

function scene0(sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene0Start(sceneProperties);
	else
		scene0Animate(sceneProperties);
}

function scene0Start(sceneProperties)
{
	const textGeometry = new TextGeometry('Testing!', {
		font: sceneProperties.font,
		size: 10,
		height: 1
	});
	const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	textMesh = new THREE.Mesh(textGeometry, material);
	sceneProperties.scene.add(textMesh);
	sceneProperties.camera.position.z = 100;
	sceneProperties.sceneStarted = true;
}

function scene0Animate(sceneProperties)
{
	textMesh.rotation.x += 0.01;
	if (textMesh.rotation.x > 1)
		scene0End(sceneProperties);
}

function scene0End(sceneProperties)
{
	sceneProperties.scene.remove(textMesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene0};