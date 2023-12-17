import * as THREE from 'three';
import {scene0} from './scene0.js';
import {scene1} from './scene1.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let sceneProperties = {sceneNum:0, sceneStarted:false};

function animate() {
	requestAnimationFrame(animate);
	switch(sceneProperties.sceneNum)
	{
		case 0:
			scene0(scene, camera, sceneProperties);
			break;
		case 1:
			scene1(scene, camera, sceneProperties);
			break;
		case 2:
			break;
	}
	renderer.render(scene, camera);
}

animate();