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
  const playerGeom = new TextGeometry('Player 1', {
    font: font,
    size: textSize,
    height: textHeight,
  });
  const winsGeom = new TextGeometry('Wins!', {
    font: font,
    size: textSize,
    height: textHeight,
  });    

  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const winsMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const playerMesh = new THREE.Mesh(playerGeom, playerMaterial);
  const winsMesh = new THREE.Mesh(winsGeom, winsMaterial);
  
  camera.position.z = 5;

  // initial state:
  playerMesh.position.x -= 11; // start x
  playerMesh.position.y += 0.5;
  scene.add(playerMesh);  

  var sceneNum = 0;
  var frameCounter = 0;
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
		switch(sceneNum) {
			case 0:
		    if(playerMesh.position.x < -3) // end x
		    {
		    	playerMesh.position.x += 0.3; // speed
		    }
		    else
		    {
					winsMesh.position.x += 9; // start x
					winsMesh.position.y -= 0.5;
		    	scene.add(winsMesh);
		    	sceneNum++;
		    }
		    break;
		  case 1:
				if(winsMesh.position.x > 0.3) // end x
				{
					winsMesh.position.x -= 0.3; // speed
				}
				else
				{
					sceneNum++;
				}
				break;
		  case 2:
				if (p2Done === true)
				{
					if (frameCounter < 70)
					{
					  frameCounter++;
					}
					else
					{
					  scene.remove(playerMesh);
					  scene.remove(winsMesh); 
					  //frameCounter = 0;
					  // call to next scene
					}
				}
				break;
			}
  }
  animate();
});