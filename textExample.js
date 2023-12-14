// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
// https://stackoverflow.com/questions/71557495/fontloader-and-textgeometry-not-working-in-threejs
THREE.Cache.enabled = true;

let container;

let camera, cameraTarget, scene, renderer;

let group, textMesh1, textGeo, materials;

let fontPath = 'node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json'

let windowHalfX = window.innerWidth / 2;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 400, 700 );
	cameraTarget = new THREE.Vector3( 0, 150, 0 );

	// SCENE
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

	// LIGHTS
	const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
	dirLight.position.set( 0, 0, 1 ).normalize();
	scene.add( dirLight );
	const pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
	pointLight.color.setHSL( Math.random(), 1, 0.5 );
	pointLight.position.set( 0, 100, 90 );
	scene.add( pointLight );
	materials = [
		new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
		new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
	];
	group = new THREE.Group();
	group.position.y = 100;
	scene.add( group );
	loadFont();
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
	);
	plane.position.y = 100;
	plane.rotation.x = - Math.PI / 2;
	scene.add( plane );

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// EVENTS
	container.style.touchAction = 'none';
	container.addEventListener( 'pointerdown', onPointerDown );
	document.addEventListener( 'keypress', onDocumentKeyPress );
	document.addEventListener( 'keydown', onDocumentKeyDown );
	pointLight.color.setHSL( Math.random(), 1, 0.5 );
	loadFont();
	window.addEventListener( 'resize', onWindowResize );
}

// function onWindowResize() {
// 	windowHalfX = window.innerWidth / 2;
// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// }

function loadFont() {
	const loader = new FontLoader();
	loader.load(fontPath, function ( response ) {
		font = response;
		refreshText();
	} );
}

function createText() {
	textGeo = new TextGeometry('Welcome to Transcendence!', {
		font: undefined,
		size: 30,
		height: 20,
		curveSegments: 4
	} );
	textGeo.computeBoundingBox();
	const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	textMesh1 = new THREE.Mesh( textGeo, materials );
	textMesh1.position.x = centerOffset;
	textMesh1.position.y = 30;
	textMesh1.position.z = 0;
	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;
	group.add( textMesh1 );
}

function refreshText() {
	group.remove( textMesh1 );
	if ( ! text ) return;
	createText();
}

function animate() {
	requestAnimationFrame( animate );
	camera.lookAt( cameraTarget );
	renderer.clear();
	renderer.render( scene, camera );
}