import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';
import {scene0} from './scene0.js';
import {scene1} from './scene1.js';
import {scene2} from './scene2.js';
import {scene3} from './scene3.js';

const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.138.3/examples/fonts/droid/droid_serif_regular.typeface.json', function (font) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	let sceneProperties = {scene:scene, camera:camera, sceneNum:0, sceneStarted:false, font:font};
	function animate() {
		requestAnimationFrame(animate);
		switch(sceneProperties.sceneNum) {
			case 0:
				scene0(sceneProperties);
				break;
			case 1:
				scene1(sceneProperties);
				break;
			case 2:
				scene2(sceneProperties);
				break;
			case 3:
				scene3(sceneProperties);
				break;								
		}
		renderer.render(scene, camera);
	}
	animate();
});