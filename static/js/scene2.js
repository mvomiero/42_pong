// documentation here: https://www.notion.so/42wolfsburgberlin/Interface-Frontend-Backend-To-Do-List-eff7e8c582ff4a32b088f6aecf87b626

// TODO: make sure score updates properly when ball gets past bats
// testing on right side only for now!
// - ghost ball appears in centre at start (not always)
// DONE: old score is not deleted!
// ball slows down, but when we switch to new browser tab, it speeds up again
// ball gets past bat on other machine - this is why it's slowing down, as we are drawing two balls
// TODO: there is a gap between bats and table
// TODO: fix issue that ball can go inside of the bat if hit from the top
// TODO: batcam!
// TODO: make sure achieving max points ends the game
// TODO: fix issue that bat gets longer on other players screen (seems ok now)
// TODO: should bats be movable before game has started?
// TODO: reinstate physics that changes bat speed depending on hit velocity
// TODO: add text names alongside score (max 8 chars)
// TODO: walls should be higher and transparent (max height ball can go)
// TODO: corresponding bat/name should appear as each player joins the game
// TODO: window resizing does not work

// ball appears only when startGameButton is pressed and when both players have joined the game
// game can be paused by pressing space bar
// make it work with 2 players in separate browsers
// TODO: implement globalSceneProperties throughout
// reinstate random ballHeight: Math.floor(Math.random() * (maxBallHeight - minBallHeight + 1)) + minBallHeight

import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';
import {OrbitControls} from 'three/OrbitControls';

var scorePlayer1 = 0, scorePlayer2 = 0;
const winningScore = 3000;
const leftPaddle = {}, rightPaddle = {}, ball = {};
var zoomFactor = 0.027, zcw, zch;
var tableMesh, tableUpperWallMesh, tableLowerWallMesh, netMesh, tableWidth, tableHeight, tableDepth;
var ballMesh, ballSize, ballSpeed, minBallHeight, maxBallHeight;
var leftPaddleMesh, rightPaddleMesh, leftPaddleX, rightPaddleX, paddleWidth, paddleHeight, paddleDepth, leftPaddleSpeed, rightPaddleSpeed;
var textSize, textHeight, textYpos, leftScoreXpos, rightScoreXpos;
var scorePlayer1Mesh, scorePlayer2Mesh;
var namePlayer1Mesh;
var globalSceneProperties;

var player1 = 'Player 1'; // eventually this needs to come from main.js
var player2 = 'Player 2'; // eventually this needs to come from main.js

var gamePaused = false;
var winner = "";
// var tournament_stage = "";
var player = 0;
// var match = 1;

function scene2(sceneProperties) {
  globalSceneProperties = sceneProperties;
  if (sceneProperties.sceneInitialised === false) // set to true in initGame
    initGame(sceneProperties);
	else if (sceneProperties.sceneStarted === true) // set by pressing start button
    startGame(sceneProperties);
  else if (sceneProperties.sceneAnimating === true) // set to true in StartGame
    animateGame(sceneProperties);
}

function initGame(sceneProperties) {
  // sendMatchInfo("update");
  console.log("initGame called");
  zcw = sceneProperties.canvas.width * zoomFactor;
  zch = sceneProperties.canvas.height * zoomFactor;
  paddleWidth = zcw * 0.02;
  paddleHeight = zcw * 0.2;
  paddleDepth = zch * 0.05;
  minBallHeight = zcw * 0.05;
  maxBallHeight = zcw * 0.15;
  initCamera(sceneProperties);
  initLight(sceneProperties);
  initTable();
  createTable(sceneProperties);
	sceneProperties.sceneInitialised = true;
}

function initCamera(sceneProperties) {
  // Set initial camera position
  sceneProperties.camera.position.set(0, 0, 10);

  // Create OrbitControls
  var controls = new OrbitControls(sceneProperties.camera, sceneProperties.renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when damping is enabled
  controls.dampingFactor = 0.25; // set to 0.25 for example, adjust as needed
  controls.screenSpacePanning = false;
  controls.minAzimuthAngle = -Math.PI / 2; // Set the minimum azimuth angle (left limit)
  controls.maxAzimuthAngle = Math.PI / 2; 
  controls.maxPolarAngle = Math.PI / 1; // limit vertical rotation

  // Handle resize events
  var onWindowResize = function () {
      sceneProperties.camera.aspect = window.innerWidth / window.innerHeight;
      sceneProperties.camera.updateProjectionMatrix();
  };

  // Add event listener for window resize
  window.addEventListener('resize', onWindowResize, false);
}

function initLight(sceneProperties) {
  const light = new THREE.PointLight(0xffddaa, 1.3, 150);
  light.position.set(0, 0, 12);
  sceneProperties.scene.add(light);
}

function startGame(sceneProperties) {
  console.log("startGame called");
  sceneProperties.sceneStarted = true;
  initLeftPaddle();
  createLeftPaddle(sceneProperties);
  initRightPaddle();
  createRightPaddle(sceneProperties);
  // initTextScoreParams needs to be moved to here!
  // createP1NameText(sceneProperties);
  initBall();
  createBall(sceneProperties);
  if (player === 1) // only player 1 sends the initial score, so that ball is only initalised once for both players
  {
    sendMatchInfo("update");
  }
}

function initTable() {
  tableWidth = zcw * 0.75;
  tableHeight = zch * 0.75;
  tableDepth = zch * 0.01;
}

function initLeftPaddle() {
  leftPaddleX = -tableWidth / 2;
  leftPaddleSpeed = 0;
  leftPaddle.y = 0;
}

function initRightPaddle() {
  rightPaddleX = tableWidth / 2;
  rightPaddleSpeed = 0;
  rightPaddle.y = 0;
}

function initBall() {
  ballSize = 0.4;
  ballSpeed = 0.05;
  ball.dirX = 1; // Math.random() < 0.5 ? 1 : -1
  ball.dirY = 1; // Math.random() < 0.5 ? 1 : -1
  ball.x = 0;
  ball.y = 0;
  ball.dx = ballSpeed * ball.dirX,
  ball.dy = ballSpeed * ball.dirY,  
  ball.height = minBallHeight;
}

function initTextScoreParams() {
  textSize = zch * 0.075;
  textHeight = zch * 0.01;
  textYpos = zch * 0.38;
  leftScoreXpos = (zcw * 0.08) - (zcw / 2);
  rightScoreXpos = (zcw * 0.87) - (zcw / 2);
}

function animateGame(sceneProperties) {
  if (!gamePaused) {
    updatePaddles(sceneProperties);
    updateBall(sceneProperties);
    if (ball.x < 0) {
      if (player === 1) {
        console.log("ball on left side, player 1 updating gameData")
        sendGameData();
      }
    }
    else {
      if (player === 2) {
        console.log("ball on right side, player 2 updating gameData")
        sendGameData();
      } 
    }
  }
}

function scene2End(sceneProperties) {  
	sceneProperties.scene.remove(ballMesh);
	sceneProperties.scene.remove(leftPaddleMesh);
	sceneProperties.scene.remove(rightPaddleMesh);
	sceneProperties.scene.remove(tableMesh);
	sceneProperties.scene.remove(scorePlayer1Mesh);
	sceneProperties.scene.remove(scorePlayer2Mesh);
	// sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
}

// game

function createBall(sceneProperties) {
    var geometry = new THREE.SphereGeometry(ballSize, 50);
    var material = new THREE.MeshPhongMaterial({color: sceneProperties.ballColour});
    ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.set(ball.x, ball.y, 0);
    sceneProperties.scene.add(ballMesh);
}

function createLeftPaddle(sceneProperties) {
    var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    var leftPaddleMeshMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.p1Colour});
    leftPaddleMesh = new THREE.Mesh(paddleGeometry, leftPaddleMeshMaterial);
    leftPaddleMesh.position.set(leftPaddleX, leftPaddle.y, 0);
    sceneProperties.scene.add(leftPaddleMesh);
}

function createRightPaddle(sceneProperties) {
  var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
  var rightPaddleMeshMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.p2Colour});
  rightPaddleMesh = new THREE.Mesh(paddleGeometry, rightPaddleMeshMaterial);
  rightPaddleMesh.position.set(rightPaddleX, rightPaddle.y, 0);
  sceneProperties.scene.add(rightPaddleMesh);
}

function createTable(sceneProperties) {
    var tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    var tableMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.tableColour});
    tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.set(0, 0, -paddleDepth/2 - tableDepth);
    sceneProperties.scene.add(tableMesh);

    var tableUpperWallGeometry = new THREE.BoxGeometry(tableWidth, zch * 0.02, tableDepth * 2);
    var tableWallsMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.tableWallsColour});    
    tableUpperWallMesh = new THREE.Mesh(tableUpperWallGeometry, tableWallsMaterial);
    tableUpperWallMesh.position.set(0, tableHeight/2, -paddleDepth/2 - tableDepth);
    sceneProperties.scene.add(tableUpperWallMesh);

    var tableLowerWallGeometry = new THREE.BoxGeometry(tableWidth, zch * 0.02, tableDepth * 2);
    var tableWallsMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.tableWallsColour});    
    tableLowerWallMesh = new THREE.Mesh(tableLowerWallGeometry, tableWallsMaterial);
    tableLowerWallMesh.position.set(0, -tableHeight/2, -paddleDepth/2 - tableDepth);
    sceneProperties.scene.add(tableLowerWallMesh); 

    var netGeometry = new THREE.BoxGeometry(zcw * 0.015, tableHeight * 0.9, tableDepth * 5);
    var netMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    var netMesh = new THREE.Mesh(netGeometry, netMaterial);
    netMesh.position.set(0, 0, 0);
    sceneProperties.scene.add(netMesh);
}

function updateBall(sceneProperties) {
  ball.x += ball.dx;
  ball.y += ball.dy;
  ballMesh.position.x = ball.x;
  ballMesh.position.y = ball.y;
  ballMesh.position.z = ball.height - ball.height * Math.abs(ball.x / (tableWidth / 2));
  checkIfBallHitTopBottomTable();
  checkIfBallHitPaddle(leftPaddle, leftPaddleX);
  checkIfBallHitPaddle(rightPaddle, rightPaddleX);
  checkIfBallPassedPaddle(sceneProperties);
}

function checkIfBallHitTopBottomTable()
{
    if (ball.y > tableHeight/2 || ball.y < -tableHeight/2) {
      ball.dy = -ball.dy;
    }  
}

function checkIfBallHitPaddle(paddle, paddleX)
{
    if (
        ball.x < paddleX + paddleWidth/2 &&
        ball.x > paddleX - paddleWidth/2 &&
        ball.y < paddle.y + paddleHeight/2 &&
        ball.y > paddle.y - paddleHeight/2
    ) {
        console.log(player, "sending");
        ball.dx = -ball.dx;
    }
}

function checkIfBallPassedPaddle(sceneProperties) {
  // left side belongs to p1, right side belongs to p2
  if (ball.x > tableWidth/2 && player === 2) {
    // reset the ball - p1 should be sending nothing
    console.log("ball passed paddle - init ball");
    initBall();
    // sendGameData();
    // this should be enough to update the ball position on both machines
    // except that player 1 will still be sending their position in the animation loop
    // who is animating?

    // // increase and update the score for both players
    // scorePlayer1++;
    // console.log("player 2 sending Match Info Update");
    // sendMatchInfo("update");
    // if (scorePlayer1 === winningScore)
    //   winner = player1;
    //   sendMatchInfo("end");
  }
  // if (ball.x < -tableWidth/2 && player === 1) {
  //   ballSpeed = 0; // prevent scoring againn whilst data gets received
  //   scorePlayer2++;
  //   sendMatchInfo("update");
  //   // if (scorePlayer2 === winningScore)
  //   //   winner = player2;
  //   //   sendMatchInfo("end");
  // }
}

function updatePaddles() {
  let newLeftPaddleY = leftPaddle.y + leftPaddleSpeed;
  if (newLeftPaddleY - paddleHeight / 2 > -tableHeight / 2 && newLeftPaddleY + paddleHeight / 2 < tableHeight / 2) {
    leftPaddleMesh.position.y = leftPaddle.y = newLeftPaddleY;
  }
  let newRightPaddleY = rightPaddle.y + rightPaddleSpeed;
  if (newRightPaddleY - paddleHeight / 2 > -tableHeight / 2 && newRightPaddleY + paddleHeight / 2 < tableHeight / 2) {
    rightPaddleMesh.position.y = rightPaddle.y = newRightPaddleY;
  }  
}

function createP1ScoreText(sceneProperties) {
  const scorePlayer1Geom = new TextGeometry(scorePlayer1.toString(), {font: sceneProperties.font, size: textSize, height: textHeight});
  const scorePlayer1Material = new THREE.MeshPhongMaterial({color: sceneProperties.p1Colour});
  scorePlayer1Mesh = new THREE.Mesh(scorePlayer1Geom, scorePlayer1Material);
  scorePlayer1Mesh.position.x = leftScoreXpos;
  scorePlayer1Mesh.position.y = textYpos;
  sceneProperties.scene.add(scorePlayer1Mesh);
}

function createP2ScoreText(sceneProperties) {
  const scorePlayer2Geom = new TextGeometry(scorePlayer2.toString(), {font: sceneProperties.font, size: textSize, height: textHeight});
  const scorePlayer2Material = new THREE.MeshPhongMaterial({color: sceneProperties.p2Colour});
  scorePlayer2Mesh = new THREE.Mesh(scorePlayer2Geom, scorePlayer2Material);
  scorePlayer2Mesh.position.x = rightScoreXpos;
  scorePlayer2Mesh.position.y = textYpos;
  sceneProperties.scene.add(scorePlayer2Mesh);
}

// function createP1NameText(sceneProperties) {
//   const namePlayer1Geom = new TextGeometry(scorePlayer2.toString(), {font: sceneProperties.font, size: textSize, height: textHeight});
//   const namePlayer1Material = new THREE.MeshPhongMaterial({color: sceneProperties.p1Colour});
//   namePlayer1Mesh = new THREE.Mesh(namePlayer1Geom, namePlayer1Material);
//   namePlayer1Mesh.position.x = leftScoreXpos;
//   namePlayer1Mesh.position.y = textYpos;
//   sceneProperties.scene.add(namePlayer1Mesh);
//   console.log("adding p1 name text");
// }

// // KEYBOARD EVENTS CODE
// // listen to keyboard events to move the paddles
document.addEventListener("keydown", function (e) {
  if (e.key === " ") {
      if (player !== 0) {
          e.preventDefault(); // Check for space bar key press
          gamePaused = !gamePaused; // Toggle game pause state
          sendGamePause();
      }
      // return;
  }

  if (player === 1) {
      if (e.key === "ArrowUp")
        leftPaddleSpeed = 0.2;
      else if (e.key === "ArrowDown")
        leftPaddleSpeed = -0.2;
  } else if (player === 2) {
      if (e.key === "ArrowUp")
        rightPaddleSpeed = 0.2;
      else if (e.key === "ArrowDown")
        rightPaddleSpeed = -0.2;
  }
});


// listen to keyboard events to stop the paddle if key is released
document.addEventListener("keyup", function (e) {
  if (player === 1) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        leftPaddleSpeed = 0;
      }
  } else if (player === 2) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        rightPaddleSpeed = 0;
      }
  }
});

// WEBSOCKET CODE

var roomCode = document.getElementById("game_board").getAttribute("room_code");
char_choice = document
  .getElementById("game_board")
  .getAttribute("char_choice");
var char_choice;
var connectionString = "ws://" + window.location.host + "/ws/play/" + roomCode + "/" + char_choice + "/";
console.log("connectionString: ", connectionString);
var gameSocket = new WebSocket(connectionString);

/*******************************************************/
/******************* SENDING DATA **********************/
/*******************************************************/

// Function to add logs to the logs div
function addLog(message, elementId) {
  const logsDiv = document.getElementById(elementId);
  logsDiv.innerHTML = `<p>${message}</p>`;
}

// Function to send log messages to the server
// function sendLogMessage(message, elementId) {
//   const logData = {
//     command: "broadcast_log",
//     message: message,
//     elementId: elementId,
//   };
//   //console.log("Sending log message:", logData);
//   gameSocket.send(JSON.stringify(logData));
// }

function sendMatchInfo(mode) {
  if (player === 0)
    return;
  console.log("SendMatchInfo called");
  var matchInfo = {
    command: "match_info",
    mode: mode,
    score: {
      player1: scorePlayer1,
      player2: scorePlayer2
    },
    // winner: winner,
  };
  gameSocket.send(JSON.stringify(matchInfo));
}

function sendGamePause() {
  console.log("SendGamePause called");
  var gamePause = {
    command: "gamePause",
    gamePaused: gamePaused,
  };
  console.log("Sending data:", gamePause);
  gameSocket.send(JSON.stringify(gamePause));
}

function sendGameData() {
  if (player === 0)
    return;
//  console.log("SendGameData called");
  var gameData = {
    command: "update",
    leftPaddle: {
      y: leftPaddle.y,
    },
    rightPaddle: {
      y: rightPaddle.y,
    },
    ball: {
      dirX: ball.dirX,
      dirY: ball.dirY,
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      height: ball.height
    }
  };
  //console.log("Sending data:", gameData);
  gameSocket.send(JSON.stringify(gameData));
}


/*******************************************************/
/***************** RECEIVING DATA **********************/
/*******************************************************/

// Event handler for successful connection
gameSocket.onopen = function (event) {
  console.log("WebSocket connection opened!");
  console.log("ConnectionString: ", connectionString);
};

gameSocket.onmessage = function (event) {
  try {
    // console.log("RECEIVED DATA:", event.data);
    var data = JSON.parse(event.data); // Parse the 'data' string within 'parsedData'
    // console.log("Parsed inner data:", data);

    if (data.command === "set_player") {
      char_choice = data.player;
      console.log("set_player called");
      console.log("char_choice:", char_choice);
    }

    if (data.command === "match_info") {
      if (data.mode === "start") {
        console.log("data.player1, data.player2", data.player1, data.player2);
        player1 = data.player1;
        player2 = data.player2;
        scorePlayer1 = 0;
        scorePlayer2 = 0;
        if (char_choice === player1) {
          player = 1;
          console.log("Player 1 set");
        }
        else if (char_choice === player2) {
          player = 2;
          console.log("Player 2 set");
        }
        else {
          player = 0;
          console.log("player set to 0");
        }
        // console.log("STAGE: " + tournament_stage);
        startGame(globalSceneProperties);
        console.log("startGame");
        addLog("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");        
      }
      else if (data.mode === "update") {
        console.log("Updating Match Data");
        scorePlayer1 = data.score.player1;
        scorePlayer2 = data.score.player2;
        initTextScoreParams();
        if (scorePlayer1Mesh)
          globalSceneProperties.scene.remove(scorePlayer1Mesh);
        createP1ScoreText(globalSceneProperties);
        if (scorePlayer2Mesh)
          globalSceneProperties.scene.remove(scorePlayer2Mesh);
        createP2ScoreText(globalSceneProperties);
        globalSceneProperties.sceneStarted = false;
        globalSceneProperties.sceneAnimating = true;
      }
      else if (data.mode === "end") {
        console.log("reciving game END message");
        console.log("winner", data.winner);
        addLog("match END!, winner is " + data.winner, "match");
        scene2End(sceneProperties);
      }
    }

    // if (data.command === "tournament_info") {
    //   console.log("TOURNAMENT_info called");
    //   console.log("data:", data);
    //   addLog("TOURNAMENT INFO: " + event.data, "tournament");
    //   // PlayerCheck if both players in the final match are set
    //   console.log("data.matchFinal.player1: ", data.matchFinal.player1);
    //   console.log("data.matchFinal.player2: ", data.matchFinal.player2);
    //   if (data.matchFinal.player1 !== undefined && data.matchFinal.player2 !== undefined) {
    //     tournament_stage = "final";
    //   } else {
    //     tournament_stage = "semifinal";
    //   }
    // }

    // Check if the received command is for broadcasting log messages
    // if (data.command === "broadcast_log") {
    //   if (data.message) {
    //     // Display the log message in the logs div using the addLog function
    //     addLog(data.message, data.elementId);
    //   }
    // }

    if (data.command === "update") {
      console.log("updating game data");
      leftPaddle.y = data.leftPaddle.y;
      rightPaddle.y = data.rightPaddle.y;
      ball.dirX = data.ball.dirX;
      ball.dirY = data.ball.dirY;
      ball.x = data.ball.x;
      ball.y = data.ball.y;
      ball.dx = data.ball.dx;
      ball.dy = data.ball.dy;
    }

    if (data.command === "gamePause") {
      console.log("Received gamePause data:", data);
      gamePaused = data.gamePaused;
    }

  } catch (error) {
    console.error("Error parsing received data:", error);
    console.log("Received data:", event.data);
    // Additional error handling or logging as needed
  }
};

// Event handler for connection closure
gameSocket.onclose = function (event) {
  console.log("WebSocket connection closed! (code: " + event.code + ")");
  setTimeout(function () {
    // if (event.code === 3001 || event.code === 3002) {
    //   window.location.href = '/dashboard';
    // }
    // else if (event.code === 4001) {
    //   window.location.href = '/error/duplicate';
    // }
    // else if (event.code === 4002) {
    //   window.location.href = '/error/full';
    // }
    // else if (event.code === 4005 || event.code === 4006) {
    //   window.location.href = '/error/disconnection';
    // }
  }, 1000); // 1000 milliseconds = 1 seconds
};

// Error handler for WebSocket errors
gameSocket.onerror = function (error) {
  console.error("WebSocket encountered an error: ", error);
  // Handle WebSocket errors
};

export {scene2};