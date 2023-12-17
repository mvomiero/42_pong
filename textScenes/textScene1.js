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
  const p1Geom = new TextGeometry('Player 1', {
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

  const p1Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const vsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const p2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const p1Mesh = new THREE.Mesh(p1Geom, p1Material);
  const vsMesh = new THREE.Mesh(vsGeom, vsMaterial);
  const p2Mesh = new THREE.Mesh(p2Geom, p2Material);
  
  camera.position.z = 5;

  // initial state:
  p1Mesh.position.x -= 11; // start x
  p1Mesh.position.y += 1;
  scene.add(p1Mesh);  

  var sceneNum = 0;
  var frameCounter = 0;
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
		switch(sceneNum) {
			case 0:
		    if(p1Mesh.position.x < -3) // end x
		    {
		    	p1Mesh.position.x += 0.3; // speed
		    }
		    else
		    {
		    	vsMesh.position.z -= 10; // start z
		    	scene.add(vsMesh);
		    	sceneNum++;
		    }
		    break;
		  case 1:
				if(vsMesh.position.z < 0) // end z
				{
					vsMesh.position.z += 0.4; // speed
				}
				else
				{
					p2Mesh.position.x += 9; // start x
					p2Mesh.position.y -= 1;
					scene.add(p2Mesh);
					sceneNum++;
				}
				break;
		  case 2:
				if(p2Mesh.position.x > 1) // end x
				{
					p2Mesh.position.x -= 0.3; // spped
				}
				else
				{
					sceneNum++;
				}
				break;
		  case 3:
				if (p2Done === true)
				{
					if (frameCounter < 70)
					{
					  frameCounter++;
					}
					else
					{
					  scene.remove(p1Mesh);
					  scene.remove(vsMesh);
					  scene.remove(p2Mesh); 
					  //frameCounter = 0;
					  // call to next scene
					}
				}
				break;
			}
  }
  animate();
});