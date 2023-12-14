import * as THREE from 'three';
import { FontLoader } from 'three/FontLoader';
import { TextGeometry } from 'three/TextGeometry';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textSize = 0.5;
const textHeight = 0.3;

const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.138.3/examples/fonts/droid/droid_serif_regular.typeface.json', function (font) {
  const count1Geom = new TextGeometry('Player 1', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const vsGeom = new TextGeometry('vs', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const p2Geom = new TextGeometry('Player 2', {
    font: font,
    size: textSize,
    height: textHeight,
  });    

  const count1Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const vsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const p2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const count1Mesh = new THREE.Mesh(count1Geom, count1Material);
  const vsMesh = new THREE.Mesh(vsGeom, vsMaterial);
  const p2Mesh = new THREE.Mesh(p2Geom, p2Material);
  
  camera.position.z = 5;

  // initial state:
  count1Mesh.position.x -= 11; // start x
  count1Mesh.position.y += 1;
  scene.add(count1Mesh);  

  var count1Done = false, vsDone = false, p2Done = false;
  var frameCounter = 0;
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if(count1Done === false)
    {
	    if(count1Mesh.position.x < -3) // end x
	    {
	    	count1Mesh.position.x += 0.3; // speed
	    }
	    else
	    {
	    	count1Done = true;
	    	vsMesh.position.z -= 10; // start z
	    	scene.add(vsMesh);
	    }
	}

	if(count1Done === true)
	{
	    if(vsMesh.position.z < 0) // end z
	    {
	    	vsMesh.position.z += 0.4; // speed
	    }
	    else if (vsDone === false)
	    {
	    	vsDone = true;
	    	p2Mesh.position.x += 9; // start x
	    	p2Mesh.position.y -= 1;
	    	scene.add(p2Mesh);
	    }
	}

	if(vsDone === true)
	{
	    if(p2Mesh.position.x > 1) // end x
	    {
	    	p2Mesh.position.x -= 0.3; // spped
	    }
	    else if (p2Done === false)
	    {
	    	p2Done = true;
	    }
	}

	if (p2Done === true)
	{
		if (frameCounter < 70)
		{
		  frameCounter++;
		}
		else
		{
		  scene.remove(count1Mesh);
		  scene.remove(vsMesh);
		  scene.remove(p2Mesh); 
		  //frameCounter = 0;
		  // call to next scene
		}
	}
  }

  animate();
});