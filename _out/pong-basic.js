//import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// vertical field of view, aspect ratio, near plane, far plane

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let player1Points = 0;
let player2Points = 0;
const maxPoints = 1;
let gameInProgress = true;

const batBallThickness = 1;
const tableWidth = 10;
const tableHeight = 6;
const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, 0.001);
const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);

const batWidth = 0.25;
const batHeight = 2;
const bat1Geometry = new THREE.BoxGeometry(batWidth, batHeight, batBallThickness);
const bat1Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const bat1 = new THREE.Mesh(bat1Geometry, bat1Material);

const bat2Geometry = new THREE.BoxGeometry(batWidth, batHeight, batBallThickness);
const bat2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const bat2 = new THREE.Mesh(bat2Geometry, bat2Material);

const ballWidth = 0.5;
const ballHeight = 0.5;
const ballGeometry = new THREE.BoxGeometry(ballWidth, ballHeight, batBallThickness);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);

scene.add(table);
scene.add(bat1);
scene.add(bat2);
scene.add(ball);

bat1.position.x -= 4.5;
bat2.position.x += 4.5;

// above, whole table
camera.position.z = 5;

const movement = { W: false, S: false, O: false, L: false };

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

let ballDir = 1;
let ballSpeed = 0.1;
const batSpeed = 0.1;

function resetBall()
{
    ball.position.x = 0;
    ball.position.y = 0;
    const random = Math.random();
    ballDir = random < 0.5 ? -1 : 1;
}

function animate() {
  requestAnimationFrame(animate);

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
  
  if (gameInProgress == false)
  {
    ballSpeed = 0;
    scene.remove(ball);
    renderer.render(scene, camera);
    return;
  }

  // ball bounce off bats
  ball.position.x += ballDir * ballSpeed;
  const bat2SurfaceX = bat2.position.x - batWidth / 2 - ballWidth / 2;
  const bat1SurfaceX = bat1.position.x + batWidth / 2 + ballWidth / 2;
  const ballTop = ball.position.y + ballHeight / 2;
  const ballBottom = ball.position.y - ballHeight / 2;

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

  // increase points when ball goes off left or right of table
  // end game when max points reached
  const ballLeft = ball.position.x + ballWidth / 2;
  const ballRight = ball.position.x - ballWidth / 2;
  const tableLeft = table.position.x - tableWidth / 2;
  const tableRight = table.position.x + tableWidth / 2;
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
  if (ballRight > tableRight)
  {
    player1Points++;
    if (player1Points > maxPoints)
    {
      gameInProgress = false;
      sendGameData();
    }
    else {
      resetBall();
    }
  }
  renderer.render(scene, camera);
}

animate();