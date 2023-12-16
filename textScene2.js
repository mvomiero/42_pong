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
  const count3Geom = new TextGeometry('3', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const count2Geom = new TextGeometry('2', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const count1Geom = new TextGeometry('1', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const beginGeom = new TextGeometry('GO!', {
    font: font,
    size: textSize,
    height: textHeight,
  });        

  const count3Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const count2Material = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const count1Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const beginMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const count3Mesh = new THREE.Mesh(count3Geom, count3Material);
  const count2Mesh = new THREE.Mesh(count2Geom, count2Material);
  const count1Mesh = new THREE.Mesh(count1Geom, count1Material);
  const beginMesh = new THREE.Mesh(beginGeom, beginMaterial);
 
 	camera.position.x += 0.15;
 	camera.position.y += 0.25;
  camera.position.z = 5;

  // initial state:
  count3Mesh.position.z = -20; // start z
  scene.add(count3Mesh);

  var sceneNum = 0;
  var frameCounter = 0;
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

		switch(sceneNum) {
			case 0:
				if(count3Mesh.position.z < 10) // end z
		    {
		    	count3Mesh.position.z += 0.3; // speed
		    }
		    else
		    {
		    	count2Mesh.position.z = -20; // start z
		    	scene.remove(count3Mesh);
		    	scene.add(count2Mesh);
		    	sceneNum++;
		    }
		    break;
			case 1:
				if(count2Mesh.position.z < 10) // end z
		    {
		    	count2Mesh.position.z += 0.3; // speed
		    }
		    else
		    {
		    	count1Mesh.position.z = -20; // start z
		    	scene.remove(count2Mesh);
		    	scene.add(count1Mesh);
		    	sceneNum++;
		    }
				break;
			case 2:
				if(count1Mesh.position.z < 10) // end z
		    {
		    	count1Mesh.position.z += 0.3; // speed
		    }
		    else
		    {
		    	beginMesh.position.z = -20; // start z
		    	scene.remove(count1Mesh);
		    	scene.add(beginMesh);
		    	sceneNum++;
		    }
				break;
			case 3:
				if(beginMesh.position.z < 5) // end z
		    {
		    	beginMesh.position.z += 0.3; // speed
		    }
		    else
		    {
		    	beginMesh.position.z = -20; // start z
		    	scene.remove(beginMesh);
		    	sceneNum++;
		    }
				break;				
		}
  }
  animate();
});