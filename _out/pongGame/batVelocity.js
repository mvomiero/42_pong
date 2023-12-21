var ball, ballSpeedX, ballSpeedY, ballVelocity;
var bat1, bat2, batSpeed, bat1Velocity, bat2Velocity, batAcceleration;
const movement = { W: false, S: false, O: false, L: false };
const keyHeldDuration = { W: 0, S: 0, O: 0, L: 0 };

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
    ballVelocity = 1;
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
    ball.position.x += ballSpeedX * ballVelocity;
    ball.position.y += ballSpeedY * ballVelocity;

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
        ballVelocity += bat1Velocity;
    }

    if (
        ball.position.x < bat2.position.x + 0.5 &&
        ball.position.x > bat2.position.x - 0.5 &&
        ball.position.y < bat2.position.y + 2 &&
        ball.position.y > bat2.position.y - 2
    ) {
        ballSpeedX = -ballSpeedX;
        ballVelocity += bat2Velocity;
    }
}

// Update bat position based on user input and key duration
function updateBats() {
    updateBatVelocity();  // Update bat velocity based on key duration

    if (movement.W && bat1.position.y < 4) {
        bat1.position.y += bat1Velocity;
    }
    if (movement.S && bat1.position.y > -4) {
        bat1.position.y -= bat1Velocity;
    }

    if (movement.O && bat2.position.y < 4) {
        bat2.position.y += bat2Velocity;
    }
    if (movement.L && bat2.position.y > -4) {
        bat2.position.y -= bat2Velocity;
    }
}

// Update bat velocity based on key duration
function updateBatVelocity() {

    if (movement.W) {
        keyHeldDuration.W += 1;  // Increment the key held duration
        bat1Velocity = batAcceleration * keyHeldDuration.W;
    } else {
        keyHeldDuration.W = 0;   // Reset the key held duration if key is released
    }
    if (movement.S) {
        keyHeldDuration.S += 1;  // Increment the key held duration
        bat1Velocity = batAcceleration * keyHeldDuration.S;
    } else {
        keyHeldDuration.S = 0;   // Reset the key held duration if key is released
    }

    if (movement.O) {
        keyHeldDuration.O += 1;  // Increment the key held duration
        bat2Velocity = batAcceleration * keyHeldDuration.O;
    } else {
        keyHeldDuration.O = 0;   // Reset the key held duration if key is released
    }
    if (movement.L) {
        keyHeldDuration.L += 1;  // Increment the key held duration
        bat2Velocity = batAcceleration * keyHeldDuration.L;
    } else {
        keyHeldDuration.L = 0;   // Reset the key held duration if key is released
    }
}

// ... (rest of your code)

// Event listeners for keydown and keyup
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

// ... (rest of your code)

// Example usage:
batSpeed = 0.05;
batAcceleration = 0.009;

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;
camera.rotation.x = 0;
camera.rotation.y = 0;
camera.rotation.z = 0;

initBatKeys();

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

