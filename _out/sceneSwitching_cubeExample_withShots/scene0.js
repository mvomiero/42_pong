import * as THREE from 'three';

var shotNum = 0;
var cube1, cube2;

function scene0(sceneProperties)
{
	if (sceneProperties.sceneStarted === false)
		scene0Start(sceneProperties);
	else
		scene0Animate(sceneProperties);
}

function scene0Start(sceneProperties)
{
	const geometry1 = new THREE.BoxGeometry(1, 1, 1);
	const material1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
	cube1 = new THREE.Mesh(geometry1, material1);
	const geometry2 = new THREE.BoxGeometry(1, 1, 1);
	const material2 = new THREE.MeshBasicMaterial({color: 0xff0000});
	cube2 = new THREE.Mesh(geometry2, material2);	
	cube1.position.x = -1;
	sceneProperties.scene.add(cube1);
	cube1.position.x = 1;
	sceneProperties.scene.add(cube2);	
	sceneProperties.camera.position.z = 5;
	sceneProperties.sceneStarted = true;
}

function scene0Animate(sceneProperties)
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
	cube1.rotation.x += 0.01;
	cube1.rotation.y += 0.01;
	cube2.rotation.x -= 0.01;
	cube2.rotation.y -= 0.01;
	if (cube1.rotation.x > 1)
		shotNum++;
}

function shot1()
{
	cube1.position.x += 0.01;
	cube1.position.y += 0.01;
	cube2.position.x -= 0.01;
	cube2.position.y -= 0.01;
	if (cube1.position.x > 2)
		shotNum++;	
}

function shot2(sceneProperties)
{
	cube1.rotation.x += 0.01;
	cube1.rotation.y += 0.01;
	cube2.rotation.x -= 0.01;
	cube2.rotation.y -= 0.01;
	if (cube1.rotation.x > 2)
	{
		shotNum = 0;
		scene0End(sceneProperties);	
	}
}

function scene0End(sceneProperties)
{
	sceneProperties.scene.remove(cube1);
	sceneProperties.scene.remove(cube2);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

export {scene0};