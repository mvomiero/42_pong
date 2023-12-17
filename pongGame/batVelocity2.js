var ball, ballSpeedX, ballSpeedY, ballVelocity;
var bat1, bat2, batSpeed, bat1Velocity, bat2Velocity, batAcceleration;
const movement = { W: false, S: false, O: false, L: false };
const keyHeldDuration = { W: 0, S: 0, O: 0, L: 0 };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // vertical field of view, aspect ratio, near plane, far plane
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var p1Score = 0;
var p2Score = 0;

// Create the ball
const ballSize = 6;
function createBall() {
    var geometry = new THREE.SphereGeometry(0.5, ballSize, ballSize);
    var material = new THREE.WireframeGeometry(geometry);
    ball = new THREE.Mesh(material);
    ball.position.set(0, 0, 0);
    scene.add(ball);

    // Initial ball speed
    ballSpeedX = 0.05 * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = 0.03;
    ballVelocity = 2;
}

var batWidth = 0.5;
var batHeight = 4;
var batDepth = 1;
// Create bats
function createBats() {
    var batGeometry = new THREE.BoxGeometry(batWidth, batHeight, batDepth);
    var batMaterial = new THREE.WireframeGeometry(batGeometry);

    bat1 = new THREE.LineSegments(batMaterial);
    bat1.position.set(-tableWidth/2, 0, 0);
    scene.add(bat1);

    bat2 = new THREE.LineSegments(batMaterial);
    bat2.position.set(tableWidth/2, 0, 0);
    scene.add(bat2);

    batSpeed = 0.05;
}

var tableWidth = 17;
var tableHeight = 12;
var tableDepth = 0.1;
// Create table
function createTable() {
    var tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    var tableMaterial = new THREE.WireframeGeometry(tableGeometry);

    table = new THREE.LineSegments(tableMaterial);
    table.position.set(0, 0, -batDepth/2 - tableDepth);
    scene.add(table);
}

// Update ball position based on its speed
function updateBall() {
    ball.position.x += ballSpeedX * ballVelocity;
    ball.position.y += ballSpeedY * ballVelocity;

    // Check collisions with top and bottom walls
    if (ball.position.y > tableHeight/2 || ball.position.y < -tableHeight/2) {
        ballSpeedY = -ballSpeedY;
    }

    // Check collisions with bats
    if (
        ball.position.x < bat1.position.x + batWidth/2 &&
        ball.position.x > bat1.position.x - batWidth/2 &&
        ball.position.y < bat1.position.y + batHeight/2 &&
        ball.position.y > bat1.position.y - batHeight/2
    ) {
        ballSpeedX = -ballSpeedX;
        ballVelocity += bat1Velocity;
    }

    if (
        ball.position.x < bat2.position.x + batWidth/2 &&
        ball.position.x > bat2.position.x - batWidth/2 &&
        ball.position.y < bat2.position.y + batHeight/2 &&
        ball.position.y > bat2.position.y - batHeight/2
    ) {
        ballSpeedX = -ballSpeedX;
        ballVelocity += bat2Velocity;
    }

    // Check if scored
    if (ball.position.x > tableWidth/2)
    {
        p1Score++;
        console.log("p1Score: ", p1Score);
        scene.remove(ball);
        createBall();
    }

    if (ball.position.x < -tableWidth/2)
    {
        p2Score++;
        console.log("p2Score: ", p1Score);
        scene.remove(ball);
        createBall();
    }
}

// Update bat position based on user input and key duration
function updateBats() {
    updateBatVelocity();  // Update bat velocity based on key duration

    if (movement.W && bat1.position.y + batHeight/2 < tableHeight/2) {
        bat1.position.y += bat1Velocity;
    }
    if (movement.S && bat1.position.y - batHeight/2 > -tableHeight/2) {
        bat1.position.y -= bat1Velocity;
    }

    if (movement.O && bat2.position.y + batHeight/2 < tableHeight/2) {
        bat2.position.y += bat2Velocity;
    }
    if (movement.L && bat2.position.y - batHeight/2 > -tableHeight/2) {
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

// // from the side
// camera.position.x = 0;
// camera.position.y = -6;
// camera.position.z = 5;
// camera.rotation.x = 1;
// camera.rotation.y = 0;
// camera.rotation.z = 0;

// // from the left
// camera.position.x = 0;
// camera.position.y = 0;
// camera.position.z = 5;
// camera.rotation.x = 0;
// camera.rotation.y = -1.5;
// camera.rotation.z = 0;

// // from the right
// camera.position.x = 0;
// camera.position.y = 0;
// camera.position.z = 5;
// camera.rotation.x = 0;
// camera.rotation.y = 1.5;
// camera.rotation.z = 0;

// // behind p1 bat
// camera.position.x = 15;
// camera.position.y = 0;
// camera.position.z = 0.6;
// camera.rotation.x = 1.577;
// camera.rotation.y = 1.561;
// camera.rotation.z = 0;

// // behind p2 bat
// camera.position.x = -5.5;
// camera.position.y = 0;
// camera.position.z = 0.6;
// camera.rotation.x = 1.577;
// camera.rotation.y = 4.722;
// camera.rotation.z = 0;

// Example usage:
createBall();
createBats();
createTable();
animate();