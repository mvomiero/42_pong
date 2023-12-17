import * as THREE from 'three';

const ballGeo = new THREE.SphereGeometry(0.5, 5, 5);
const ballMat = new THREE.LineBasicMaterial({ color: 0xffffff});
const ball = new THREE.LineSegments(ballGeo, ballMat);

function scene0Animate()
{
	if (sceneInProgress === false)
	{
		sceneInProgress = true;
		scene.add(ball);
	}
	else
	{
		if (ball.position.y > 2)
		{
			scene.remove(ball);
			sceneInProgress = false;
			sceneNum++;
		}
		else
		{
			ball.position.y += 0.05;
		}
	}
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.LineBasicMaterial({ color: 0xffffff});
const box = new THREE.LineSegments(boxGeo, boxMat);

function scene1Animate()
{
    if (sceneInProgress === false)
    {
				sceneInProgress = true;
        scene.add(box);
    }
    else
    {
        if (box.position.y < -2)
        {
						sceneInProgress = false;
            scene.remove(box);
            sceneNum++;
        }
        else
        {
            box.position.y -= 0.05;
        }
    }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
var sceneNum = 0;
var sceneInProgress = false;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  switch(sceneNum)
  {
	  case 0:
	  	scene0Animate();
	  	break;
	  case 1:
	  	scene1Animate();
	  	break;	  	
  }
}
animate();