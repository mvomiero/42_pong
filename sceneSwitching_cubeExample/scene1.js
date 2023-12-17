import * as THREE from 'three';

var sphere1, sphere2;

function scene1(scene, camera, sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene1Start(scene, camera, sceneProperties);
	else
		scene1Animate(scene, camera, sceneProperties);
}

function scene1Start(scene, camera, sceneProperties)
{
	const geometry1 = new THREE.SphereGeometry(0.75, 4, 4);
	const material1 = new THREE.MeshBasicMaterial({color: 0xffff00});
	sphere1 = new THREE.Mesh(geometry1, material1);
	const geometry2 = new THREE.SphereGeometry(0.75, 4, 4);
	const material2 = new THREE.MeshBasicMaterial({color: 0x00ffff});
	sphere2 = new THREE.Mesh(geometry2, material2);	
	sphere1.position.x = -1;
	scene.add(sphere1);
	sphere1.position.x = 1;
	scene.add(sphere2);	
	camera.position.z = 5;
	sceneProperties.sceneStarted = true;
}

function scene1Animate(scene, camera, sceneProperties)
{
	sphere1.rotation.x += 0.01;
	sphere1.rotation.y += 0.01;
	sphere2.rotation.x -= 0.01;
	sphere2.rotation.y -= 0.01;
	if (sphere1.rotation.x > 1)
		scene1End(scene, sceneProperties);
}

function scene1End(scene, sceneProperties)
{
	scene.remove(sphere1);
	scene.remove(sphere2);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum--;
}

export {scene1};