
var ball, ballSpeedX, ballSpeedY;
var bat1, bat2, batSpeed;
const movement = { W: false, S: false, O: false, L: false };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // vertical field of view, aspect ratio, near plane, far plane
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the ball
function createBall() {
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.WireframeGeometry(geometry);
    ball = new THREE.Mesh(material);
    ball.position.set(0, 0, 0);
    scene.add(ball);

    // Initial ball speed
    ballSpeedX = 0.05;
    ballSpeedY = 0.03;
}

// Create bats
function createBats() {
    var batGeometry = new THREE.BoxGeometry(1, 4, 1);
    var batMaterial = new THREE.WireframeGeometry(batGeometry);

    bat1 = new THREE.LineSegments(batMaterial);
    bat1.position.set(-5, 0, 0);
    scene.add(bat1);

    bat2 = new THREE.LineSegments(batMaterial);
    bat2.position.set(5, 0, 0);
    scene.add(bat2);

    batSpeed = 0.05;
}

// Update ball position based on its speed
function updateBall() {
    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;

    // Check collisions with top and bottom walls
    if (ball.position.y > 4.5 || ball.position.y < -4.5) {
        ballSpeedY = -ballSpeedY;
    }

    // Check collisions with bats
    if (
        ball.position.x < bat1.position.x + 0.5 &&
        ball.position.x > bat1.position.x - 0.5 &&
        ball.position.y < bat1.position.y + 2 &&
        ball.position.y > bat1.position.y - 2
    ) {
        ballSpeedX = -ballSpeedX;
    }

    if (
        ball.position.x < bat2.position.x + 0.5 &&
        ball.position.x > bat2.position.x - 0.5 &&
        ball.position.y < bat2.position.y + 2 &&
        ball.position.y > bat2.position.y - 2
    ) {
        ballSpeedX = -ballSpeedX;
    }
}

// Update bat position based on user input
function updateBats() {
    if (movement.W && bat1.position.y < 2) {
        bat1.position.y += batSpeed;
    }
    if (movement.S && bat1.position.y > -2) {
        bat1.position.y -= batSpeed;
    }

    if (movement.O && bat2.position.y < 2) {
        bat2.position.y += batSpeed;
    }
    if (movement.L && bat2.position.y > -2) {
        bat2.position.y -= batSpeed;
    }
}

function initBatKeys() {
  document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    if (key in movement) {
      movement[key] = true;
    }
  });
  document.addEventListener("keyup", (event) => {
    const key = event.key.toUpperCase();
    if (key in movement) {
      movement[key] = false;
    }
  });
}

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;
camera.rotation.x = 0;
camera.rotation.y = 0;
camera.rotation.z = 0;

initBatKeys()

// Your animation/rendering loop
function animate() {
    // Update ball and bat positions
    updateBall();
    updateBats();

    // Render the scene
    renderer.render(scene, camera);

    // Call animate recursively
    requestAnimationFrame(animate);
}

// Example usage:
createBall();
createBats();
animate();
