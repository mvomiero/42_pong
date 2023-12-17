import * as THREE from 'three';

var shotNum = 0;
var sphere1, sphere2;

function scene1(sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene1Start(sceneProperties);
	else
		scene1Animate(sceneProperties);
}

function scene1Start(sceneProperties)
{
	const geometry1 = new THREE.SphereGeometry(0.75, 4, 4);
	const material1 = new THREE.MeshBasicMaterial({color: 0xffff00});
	sphere1 = new THREE.Mesh(geometry1, material1);
	const geometry2 = new THREE.SphereGeometry(0.75, 4, 4);
	const material2 = new THREE.MeshBasicMaterial({color: 0x00ffff});
	sphere2 = new THREE.Mesh(geometry2, material2);	
	sphere1.position.x = -1;
	sceneProperties.scene.add(sphere1);
	sphere1.position.x = 1;
	sceneProperties.scene.add(sphere2);	
	sceneProperties.camera.position.z = 5;
	sceneProperties.sceneStarted = true;
}

function scene1Animate(sceneProperties)
{
	switch(shotNum)
	{
		case 0:
			shot0();
			break;
		case 1:
			shot1();
			break;
		case 2:
			shot2(sceneProperties);
			break;					
	}
}

function shot0()
{
	sphere1.rotation.x += 0.01;
	sphere1.rotation.y += 0.01;
	sphere2.rotation.x -= 0.01;
	sphere2.rotation.y -= 0.01;
	if (sphere1.rotation.x > 1)
		shotNum++;
}

function shot1()
{
	sphere1.position.x += 0.01;
	sphere1.position.y += 0.01;
	sphere2.position.x -= 0.01;
	sphere2.position.y -= 0.01;
	if (sphere1.position.x > 2)
		shotNum++;	
}

function shot2(sceneProperties)
{
	sphere1.rotation.x += 0.01;
	sphere1.rotation.y += 0.01;
	sphere2.rotation.x -= 0.01;
	sphere2.rotation.y -= 0.01;
	if (sphere1.rotation.x > 2)
	{
		shotNum = 0;
		scene1End(sceneProperties);	
	}
}

function scene1End(sceneProperties)
{
	sceneProperties.scene.remove(sphere1);
	sceneProperties.scene.remove(sphere2);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum--;
}

export {scene1};