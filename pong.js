// initialisation functions:
function makeTable() {
  const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, 0.001);
  const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  return table;
}

function makeBat1() {
  const bat1Geometry = new THREE.BoxGeometry(batWidth, batHeight, batBallThickness);
  const bat1Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const bat1 = new THREE.Mesh(bat1Geometry, bat1Material);
  return bat1;
}

function makeBat2() {
  const bat2Geometry = new THREE.BoxGeometry(batWidth, batHeight, batBallThickness);
  const bat2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const bat2 = new THREE.Mesh(bat2Geometry, bat2Material);
  return bat2;
}

function makeBall() {
  const ballGeometry = new THREE.BoxGeometry(ballWidth, ballHeight, batBallThickness);
  const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  return ball;
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

// animation functions:
function moveBall()
{
  ball.position.x += ballDir * ballSpeed;
}

// ball bounce off bats
function moveBats()
{
   // bat key movement
  const tableTop = table.position.y + tableHeight / 2;
  const tableBottom = table.position.y - tableHeight / 2;
  const bat1Top = bat1.position.y + batHeight / 2;
  const bat1Bottom = bat1.position.y - batHeight / 2;
  const bat2Top = bat2.position.y + batHeight / 2;
  const bat2Bottom = bat2.position.y - batHeight / 2;

  if (movement.W && bat1Top < tableTop) {
    bat1.position.y += batSpeed;
  }
  if (movement.S && bat1Bottom > tableBottom) {
    bat1.position.y -= batSpeed;
  }
  if (movement.O && bat2Top < tableTop) {
    bat2.position.y += batSpeed;
  }
  if (movement.L && bat2Bottom > tableBottom) {
    bat2.position.y -= batSpeed;
  }
}

function changeBallDirectionIfBallHitsBats()
{
  const bat2SurfaceX = bat2.position.x - batWidth / 2 - ballWidth / 2;
  const bat1SurfaceX = bat1.position.x + batWidth / 2 + ballWidth / 2;
  const ballTop = ball.position.y + ballHeight / 2;
  const ballBottom = ball.position.y - ballHeight / 2;
  const bat1Top = bat1.position.y + batHeight / 2;
  const bat1Bottom = bat1.position.y - batHeight / 2;
  const bat2Top = bat2.position.y + batHeight / 2;
  const bat2Bottom = bat2.position.y - batHeight / 2;  

  if (ball.position.x > bat2SurfaceX
    && ballBottom < bat2Top
    && ballTop > bat2Bottom)
  {
    ballDir = ballDir * -1;
  }
  if (ball.position.x < bat1SurfaceX
    && ballBottom < bat1Top
    && ballTop > bat1Bottom)
  {
    ballDir = ballDir * -1;
  }  
}

function resetBall()
{
    ball.position.x = 0;
    ball.position.y = 0;
    const random = Math.random();
    ballDir = random < 0.5 ? -1 : 1;
}

function checkBallOffTableLeft() {
  const ballLeft = ball.position.x + ballWidth / 2;
  const tableLeft = table.position.x - tableWidth / 2;
  if (ballLeft < tableLeft)
  {
    player2Points++;
    if (player2Points > maxPoints)
    {
      gameInProgress = false;
    }
    else {
      resetBall();
    }
  }
}

function checkBallOffTableRight()
{
  const ballRight = ball.position.x - ballWidth / 2;
  const tableRight = table.position.x + tableWidth / 2;
  if (ballRight > tableRight)
  {
    player1Points++;
    if (player1Points > maxPoints)
    {
      gameInProgress = false;
    }
    else {
      resetBall();
    }
  }  
}

function stopBallIfGameNotInProgress()
{
  if (gameInProgress == false)
  {
    ballSpeed = 0;
    scene.remove(ball);
  }
}

// initialisation:
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // vertical field of view, aspect ratio, near plane, far plane
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let ballDir = 1;
let ballSpeed = 0.1;
const batSpeed = 0.1;
const tableWidth = 10;
const tableHeight = 6;
const batBallThickness = 1;
const batWidth = 0.25;
const batHeight = 2;
const ballWidth = 0.5;
const ballHeight = 0.5;

let player1Points = 0;
let player2Points = 0;
const maxPoints = 1;
let gameInProgress = true;

const table = makeTable();
const bat1 = makeBat1();
const bat2 = makeBat2();
const ball = makeBall();

scene.add(table);
scene.add(bat1);
scene.add(bat2);
scene.add(ball);

bat1.position.x -= 4.5;
bat2.position.x += 4.5;

// from the top (default)
// camera.position.x = 0;
// camera.position.y = 0;
// camera.position.z = 5;
// camera.rotation.x = 0;
// camera.rotation.y = 0;
// camera.rotation.z = 0;

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
// camera.position.x = 6;
// camera.position.y = 0;
// camera.position.z = 1.2;
// camera.rotation.x = 1.585;
// camera.rotation.y = 1.5;
// camera.rotation.z = 0;

// // behind p1 bat
// camera.position.x = 5.5;
// camera.position.y = 0;
// camera.position.z = 1.2;
// camera.rotation.x = 1.577;
// camera.rotation.y = 1.561;
// camera.rotation.z = 0;

// // behind p2 bat
// camera.position.x = -5.5;
// camera.position.y = 0;
// camera.position.z = 1.2;
// camera.rotation.x = 1.577;
// camera.rotation.y = 4.722;
// camera.rotation.z = 0;


const movement = { W: false, S: false, O: false, L: false };

initBatKeys();

function animate() {
  requestAnimationFrame(animate);
  moveBats();
  moveBall();
  changeBallDirectionIfBallHitsBats();
  checkBallOffTableLeft();
  checkBallOffTableRight();
  stopBallIfGameNotInProgress();

  // // animation: from the side -> from the top
  // if (camera.rotation.x > 0)
  // {
  //   camera.rotation.x -= 0.03;
  //   camera.position.y += 0.18;
  // }
     
  // // animation: from the left -> from the top
  // if (camera.rotation.y < 0)
  //   camera.rotation.y += 0.03

  // // animation: from the right -> from the top
  // if (camera.rotation.y > 0)
  //   camera.rotation.y -= 0.03 

  renderer.render(scene, camera);
}

animate();