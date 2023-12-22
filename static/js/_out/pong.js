import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

// no canvas
// no countdown
// no pause before start
// no ability to pause
// addLog function is defined in webSocket.js
// we place the initial values in leftPaddle, rightPaddle and ball objects, and createPaddles and createBall functions will pick them up

var scorePlayer1 = 0;
var scorePlayer2 = 0;
const winningScore = 3;
var scorePlayer1Mesh;
var scorePlayer2Mesh;
var ballMesh;
var leftPaddleMesh, rightPaddleMesh, batSpeed = 0.05, leftPaddleVelocity, rightPaddleVelocity;
//paddleAcceleration = 0.009;
var paddleDepth = 1;
var tableMesh;
var tableWidth = 17;
var tableHeight = 12;
var tableDepth = 0.1;
var player1 = 'Player 1'; // eventually this needs to come from main.js
var player2 = 'Player 2'; // eventually this needs to come from main.js
var winner = "";
var match = 1;

const leftPaddle = {
  x: -tableWidth / 2,
  y: 0,
  width: 0.5,
  height: 4,
  dy: 0, // paddle velocity
};
const rightPaddle = {
  x: tableWidth / 2,
  y: 0,
  width: 0.5,
  height: 4,
  dy: 0, // paddle velocity
};
const ball = {
  x: 0,
  y: 0,
  width: 6,
  height: 6,
  dx: 0, // ball velocity (start going to the top-right corner)
  dy: 0,
  speed: 5,
  resetting: false, // keep track of when need to reset the ball position
};

function scene2(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene2Start(sceneProperties);
	else
		scene2Animate(sceneProperties);
}

function scene2Start(sceneProperties) {
  sendGameData(); // here or at end of function?
  sendMatchInfo("update");
	sceneProperties.camera.position.x = 0;
	sceneProperties.camera.position.y = 0;
	sceneProperties.camera.position.z = 10;
	sceneProperties.camera.rotation.x = 0;
	sceneProperties.camera.rotation.y = 0;
	sceneProperties.camera.rotation.z = 0;
	initBatKeys();	
	createBall(sceneProperties);
	createPaddles(sceneProperties);
	createTable(sceneProperties);
	createScoreText(sceneProperties);
	sceneProperties.sceneStarted = true;
}

function scene2Animate(sceneProperties) {
  updateBall(sceneProperties);
  updatePaddles(sceneProperties);
  sendMatchInfo("update");
  sendGameData();    
}

function scene2End(sceneProperties, winnerName, winnerColour) {  
  sceneProperties.winnerName = winnerName;
  sceneProperties.winnerColour = winnerColour;
	sceneProperties.scene.remove(ball);
	sceneProperties.scene.remove(leftPaddleMesh);
	sceneProperties.scene.remove(rightPaddleMesh);
	sceneProperties.scene.remove(table);
	sceneProperties.scene.remove(scorePlayer1Mesh);
	sceneProperties.scene.remove(scorePlayer2Mesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
  // marcoflo code:
  winner = winnerName;
  sendMatchInfo("update");
  sendMatchInfo("end");
}

// game

function createBall(sceneProperties) {
    var geometry = new THREE.SphereGeometry(0.5, ball.width, ball.height);
    var material = new THREE.MeshBasicMaterial({color: sceneProperties.ballColour});
    ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.set(ball.x, ball.y, 0);
    sceneProperties.scene.add(ballMesh);
    // Initial ball speed
    ball.speed = 0.05 * (Math.random() < 0.5 ? 1 : -1);
    ball.dx = 2;
    ball.dy = 2;
}

function createPaddles(sceneProperties) {
    var batGeometry = new THREE.BoxGeometry(paddle.width, paddle.height, paddleDepth);
    var leftPaddleMeshMaterial = new THREE.MeshBasicMaterial({color: sceneProperties.p1Colour});
    leftPaddleMesh = new THREE.Mesh(batGeometry, leftPaddleMeshMaterial);
    leftPaddleMesh.position.set(leftPaddle.x, leftPaddle.y, 0);
    sceneProperties.scene.add(leftPaddleMesh);
    var rightPaddleMeshMaterial = new THREE.MeshBasicMaterial({color: sceneProperties.p2Colour});
    rightPaddleMesh = new THREE.Mesh(batGeometry, rightPaddleMeshMaterial);
    rightPaddleMesh.position.set(rightPaddle.x, rightPaddle.y, 0);
    sceneProperties.scene.add(rightPaddleMesh);
    batSpeed = 0.05;
}

function createTable(sceneProperties) {
    var tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    var tableMaterial = new THREE.MeshBasicMaterial({color: sceneProperties.tableColour});
    tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.set(0, 0, -paddleDepth/2 - tableDepth);
    sceneProperties.scene.add(tableMesh);
}

// Update bat position based on user input and key duration
function updatePaddles() {
  if (movement.W && leftPaddle.position.y + batHeight/2 < tableHeight/2) {
      leftPaddle.position.y += bat1Velocity;
  }
  if (movement.S && leftPaddle.position.y - batHeight/2 > -tableHeight/2) {
      leftPaddle.position.y -= bat1Velocity;
  }
  if (movement.O && rightPaddle.position.y + batHeight/2 < tableHeight/2) {
      rightPaddle.position.y += bat2Velocity;
  }
  if (movement.L && rightPaddle.position.y - batHeight/2 > -tableHeight/2) {
      rightPaddle.position.y -= bat2Velocity;
  }
}

function updateBall(sceneProperties) {
    ball.position.x += ball.speed * ball.dx;
    ball.position.y += ball.speed * ball.dy;

    // Check collisions with top and bottom walls
    if (ball.position.y > tableHeight/2 || ball.position.y < -tableHeight/2) {
      ball.speed = -ball.speed;
    }

    // Check collisions with bats
    if (
        ball.position.x < leftPaddleMesh.position.x + paddle.width/2 &&
        ball.position.x > leftPaddleMesh.position.x - paddle.width/2 &&
        ball.position.y < leftPaddleMesh.position.y + paddle.height/2 &&
        ball.position.y > leftPaddleMesh.position.y - paddle.height/2
    ) {
        ball.speed = -ball.speed;
        ball.dx += leftPaddleVelocity;
        ball.dy += leftPaddleVelocity;
    }

    if (
        ball.position.x < rightPaddleMesh.position.x + paddle.width/2 &&
        ball.position.x > rightPaddleMesh.position.x - paddle.width/2 &&
        ball.position.y < rightPaddleMesh.position.y + paddle.height/2 &&
        ball.position.y > rightPaddleMesh.position.y - paddle.height/2
    ) {
        ball.speed = -ball.speed;
        ball.dx += rightPaddleVelocity;
        ball.dy += rightPaddleVelocity;
    }

    // Check if scored
    if (ball.position.x > tableWidth/2)
    {
        scorePlayer1++;
		    updateScore(sceneProperties);
        if (scorePlayer1 === winningScore)
        	scene2End(sceneProperties, sceneProperties.p1Name, sceneProperties.p1Colour);		
    }

    if (ball.position.x < -tableWidth/2)
    {
        scorePlayer2++;      
		    updateScore(sceneProperties);
        if (scorePlayer2 === winningScore)
        	scene2End(sceneProperties, sceneProperties.p2Name, sceneProperties.p1Name);  		
    }
}

function updateScore(sceneProperties) {
	sceneProperties.scene.remove(scorePlayer1Mesh);
	sceneProperties.scene.remove(scorePlayer2Mesh);
	createScoreText(sceneProperties);
	sceneProperties.scene.remove(ball);
	createBall(sceneProperties);	
}

function createScoreText(sceneProperties) {
    const textSize = 3;
    const textHeight = 0.3;
    const scorePlayer1Geom = new TextGeometry(scorePlayer1.toString(), {font: sceneProperties.font, size: textSize, height: textHeight});
    const scorePlayer2Geom = new TextGeometry(scorePlayer2.toString(), {font: sceneProperties.font, size: textSize, height: textHeight});
    const scorePlayer1Material = new THREE.MeshBasicMaterial({color: sceneProperties.p1Colour});
    const scorePlayer2Material = new THREE.MeshBasicMaterial({color: sceneProperties.p2Colour});
    scorePlayer1Mesh = new THREE.Mesh(scorePlayer1Geom, scorePlayer1Material);
    scorePlayer2Mesh = new THREE.Mesh(scorePlayer2Geom, scorePlayer2Material);
    scorePlayer1Mesh.position.x = (-(tableWidth/2) - 3 - 2);
    scorePlayer1Mesh.position.y -= 1.4;
    sceneProperties.scene.add(scorePlayer1Mesh);
    scorePlayer2Mesh.position.x = (tableWidth/2) + 3 - 2;
    scorePlayer2Mesh.position.y -= 1.4;
    sceneProperties.scene.add(scorePlayer2Mesh);
}

// MINE

// keyboardEvents.js
// const movement = {W: false, S: false, O: false, L: false};
// const keyHeldDuration = {W: 0, S: 0, O: 0, L: 0};
// updateBatVelocity();  // Update bat velocity based on key duration

// // Update bat velocity based on key duration
// function updateBatVelocity() {
//     if (movement.W) {
//         keyHeldDuration.W += 1;  // Increment the key held duration
//         leftPaddleVelocity = paddleAcceleration * keyHeldDuration.W;
//     } else {
//         keyHeldDuration.W = 0;   // Reset the key held duration if key is released
//     }
//     if (movement.S) {
//         keyHeldDuration.S += 1;  // Increment the key held duration
//         leftPaddleVelocity = paddleAcceleration * keyHeldDuration.S;
//     } else {
//         keyHeldDuration.S = 0;   // Reset the key held duration if key is released
//     }
//     if (movement.O) {
//         keyHeldDuration.O += 1;  // Increment the key held duration
//         rightPaddleVelocity = paddleAcceleration * keyHeldDuration.O;
//     } else {
//         keyHeldDuration.O = 0;   // Reset the key held duration if key is released
//     }
//     if (movement.L) {
//         keyHeldDuration.L += 1;  // Increment the key held duration
//         rightPaddleVelocity = paddleAcceleration * keyHeldDuration.L;
//     } else {
//         keyHeldDuration.L = 0;   // Reset the key held duration if key is released
//     }
// }

// // Event listeners for keydown and keyup
// function initBatKeys() {
//     document.addEventListener("keydown", (event) => {
//         const key = event.key.toUpperCase();
//         if (key in movement) {
//             movement[key] = true;
//         }
//     });
//     document.addEventListener("keyup", (event) => {
//         const key = event.key.toUpperCase();
//         if (key in movement) {
//             movement[key] = false;
//         }
//     });
// }

// MARCOFLOS

// listen to keyboard events to move the paddles
document.addEventListener("keydown", function (e) {
  if (e.key === " ") {
      if (player !== 0) {
          e.preventDefault(); // Check for space bar key press
          gamePaused = !gamePaused; // Toggle game pause state
          sendGamePause();
      }
      return;
  }

  // Player 1 controls (left paddle) - Arrow keys
  if (player === 1) {
      console.log("Player 1 moving paddle");
      // Up arrow key
      if (e.key === "ArrowUp" && leftPaddle.position.y + batHeight/2 < tableHeight/2) {
          leftPaddle.position.y += leftPaddleVelocity;
      }
      // Down arrow key
      else if (e.key === "ArrowDown" && leftPaddle.position.y - batHeight/2 > -tableHeight/2) {
          leftPaddle.position.y -= leftPaddleVelocity;
      }
  }

  // Player 2 controls (right paddle) - Arrow keys
  if (player === 2) {
      console.log("Player 2 moving paddle");
      // Up arrow key
      if (e.key === "ArrowUp" && rightPaddle.position.y + batHeight/2 < tableHeight/2) {
          rightPaddle.position.y += rightPaddleVelocity;
      }
      // Down arrow key
      else if (e.key === "ArrowDown" && rightPaddle.position.y - batHeight/2 > -tableHeight/2) {
          rightPaddle.position.y -= rightPaddleVelocity;
      }
  }
  sendGameData();
});

// // listen to keyboard events to stop the paddle if key is released
// document.addEventListener("keyup", function (e) {
//     // Player 1 controls
//     if (player === 1) {
//         if (e.key === "ArrowUp" || e.key === "ArrowDown") {
//             leftPaddle.dy = 0;
//         }
//     }

//     // Player 2 controls
//     if (player === 2) {
//         if (e.key === "ArrowUp" || e.key === "ArrowDown") {
//             rightPaddle.dy = 0;
//         }
//     }
//     sendGameData();
// });

// HTML Button click event to trigger the WebSocket actions
document.getElementById("startGameButton").addEventListener("click", function () {
  // Call the function when the button is clicked
  scene2(sceneProperties);
});


export {scene2};