import * as THREE from 'three';

var cube1, cube2;

function scene0(scene, camera, sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene0Start(scene, camera, sceneProperties);
	else
		scene0Animate(scene, camera, sceneProperties);
}

function scene0Start(scene, camera, sceneProperties)
{
	const geometry1 = new THREE.BoxGeometry(1, 1, 1);
	const material1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
	cube1 = new THREE.Mesh(geometry1, material1);
	const geometry2 = new THREE.BoxGeometry(1, 1, 1);
	const material2 = new THREE.MeshBasicMaterial({color: 0xff0000});
	cube2 = new THREE.Mesh(geometry2, material2);	
	cube1.position.x = -1;
	scene.add(cube1);
	cube1.position.x = 1;
	scene.add(cube2);	
	camera.position.z = 5;
	sceneProperties.sceneStarted = true;
}

function scene0Animate(scene, camera, sceneProperties)
{
	cube1.rotation.x += 0.01;
	cube1.rotation.y += 0.01;
	cube2.rotation.x -= 0.01;
	cube2.rotation.y -= 0.01;
	if (cube1.rotation.x > 1)
		scene0End(scene, sceneProperties);
}

function scene0End(scene, sceneProperties)
{
	scene.remove(cube1);
	scene.remove(cube2);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene0};