import * as THREE from 'three';
import { FontLoader } from 'three/FontLoader';
import { TextGeometry } from 'three/TextGeometry';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load a font using FontLoader
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.138.3/examples/fonts/droid/droid_serif_regular.typeface.json', function (font) {
  const textGeometry = new TextGeometry('Hello, Three.js!', {
    font: font,
    size: 10,
    height: 1,
  });

  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const textMesh = new THREE.Mesh(textGeometry, material);

  scene.add(textMesh);

  camera.position.z = 100;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
});