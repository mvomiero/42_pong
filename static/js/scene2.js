import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';

var scorePlayer1 = 0, scorePlayer2 = 0;
const winningScore = 3333;
const leftPaddle = {}, rightPaddle = {}, ball = {};
var zoomFactor = 0.027, zcw, zch;
var tableMesh, tableWidth, tableHeight, tableDepth;
var ballMesh, ballWidth, ballHeight, ballSpeed, ballDx, ballDy;
var leftPaddleMesh, rightPaddleMesh, leftPaddleX, rightPaddleX, paddleWidth, paddleHeight, paddleDepth, paddleSpeed;
var scorePlayer1Mesh, scorePlayer2Mesh, scoreSize, scoreHeight, scoreYpos, leftScoreXpos, rightScoreXpos;

var player1 = 'Player 1'; // eventually this needs to come from main.js
var player2 = 'Player 2'; // eventually this needs to come from main.js

var gamePaused = false;
var winner = "";
var tournament_stage = "";
var player = 0;
// var match = 1;

function startGame() {
  // should this just be done in scene2Start?!? Probably
  console.log("startGamefunction called!");
  // sendGameData(); // needed
  addLog("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");
}

function scene2(sceneProperties) {
	if (sceneProperties.sceneStarted === false)
		scene2Start(sceneProperties);
	else
		scene2Animate(sceneProperties);
}

function scene2Start(sceneProperties) {
  // sendMatchInfo("update");
  zcw = sceneProperties.canvas.width * zoomFactor;
  zch = sceneProperties.canvas.height * zoomFactor;
  initTable();
  initPaddles();
  initBall();
  initScore();
  sendGameData(); // here or at end of function or at all?
	sceneProperties.camera.position.x = 0;
	sceneProperties.camera.position.y = 0;
	sceneProperties.camera.position.z = 10;
	sceneProperties.camera.rotation.x = 0;
	sceneProperties.camera.rotation.y = 0;
	sceneProperties.camera.rotation.z = 0;

  // sceneProperties.camera.position.x = 0;
  // sceneProperties.camera.position.y = -15;
  // sceneProperties.camera.position.z = 2;
  // sceneProperties.camera.rotation.x = 1.4;
  // sceneProperties.camera.rotation.y = 0;
  // sceneProperties.camera.rotation.z = 0;  
  const light = new THREE.PointLight(0xffddaa, 1.3, 150);
  light.position.set(0, 0, 12);
  sceneProperties.scene.add(light);  
	createBall(sceneProperties);
	createPaddles(sceneProperties);
	createTable(sceneProperties);
	createP1ScoreText(sceneProperties);
  createP2ScoreText(sceneProperties);
	sceneProperties.sceneStarted = true;
}

function initTable() {
  tableWidth = zcw * 0.75;
  tableHeight = zch * 0.75;
  tableDepth = zch * 0.01;
}

function initPaddles() {
  paddleWidth = zcw * 0.02;
  paddleHeight = zcw * 0.2;
  paddleDepth = zch * 0.05;
  leftPaddleX = -tableWidth / 2;
  rightPaddleX = tableWidth / 2;
  paddleSpeed = 0;
  leftPaddle.y = 0;
  rightPaddle.y = 0;
}

function initBall() {
  ball.x = 0;
  ball.y = 0;
  ballWidth = 6;
  ballHeight = 6;
  ballSpeed = 0.15;
  // ballDx = ballSpeed * (Math.random() < 0.5 ? 1 : -1);
  // ballDy = ballSpeed * (Math.random() < 0.5 ? 1 : -1);
  ballDx = ballSpeed * -1;
  ballDy = ballSpeed * -1;  
}

function initScore() {
  scoreSize = zch * 0.075;
  scoreHeight = zch * 0.01;
  scoreYpos = zch * 0.38;
  leftScoreXpos = (zcw * 0.08) - (zcw / 2);
  rightScoreXpos = (zcw * 0.87) - (zcw / 2);
}

function scene2Animate(sceneProperties) {
  // sendMatchInfo("update");
  // if (!gamePaused) {
    updatePaddles(sceneProperties);
    updateBall(sceneProperties);
    
  // }
  sendGameData();
}

function scene2End(sceneProperties, winnerName, winnerColour) {  
  sceneProperties.winnerName = winnerName;
  sceneProperties.winnerColour = winnerColour;
	sceneProperties.scene.remove(ballMesh);
	sceneProperties.scene.remove(leftPaddleMesh);
	sceneProperties.scene.remove(rightPaddleMesh);
	sceneProperties.scene.remove(tableMesh);
	sceneProperties.scene.remove(scorePlayer1Mesh);
	sceneProperties.scene.remove(scorePlayer2Mesh);
	sceneProperties.sceneStarted = false;
	sceneProperties.sceneNum++;
  // winner = winnerName;
  // sendMatchInfo("update");
  // sendMatchInfo("end");
}

// game

function createBall(sceneProperties) {
    var geometry = new THREE.SphereGeometry(0.5, ball.width, ball.height);
    var material = new THREE.MeshPhongMaterial({color: sceneProperties.ballColour});
    ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.set(ball.x, ball.y, 0);
    sceneProperties.scene.add(ballMesh);
}

function createPaddles(sceneProperties) {
    var batGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    var leftPaddleMeshMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.p1Colour});
    leftPaddleMesh = new THREE.Mesh(batGeometry, leftPaddleMeshMaterial);
    leftPaddleMesh.position.set(leftPaddleX, leftPaddle.y, 0);
    sceneProperties.scene.add(leftPaddleMesh);
    var rightPaddleMeshMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.p2Colour});
    rightPaddleMesh = new THREE.Mesh(batGeometry, rightPaddleMeshMaterial);
    rightPaddleMesh.position.set(rightPaddleX, rightPaddle.y, 0);
    sceneProperties.scene.add(rightPaddleMesh);
}

function createTable(sceneProperties) {
    var tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    var tableMaterial = new THREE.MeshPhongMaterial({color: sceneProperties.tableColour});
    tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.set(0, 0, -paddleDepth/2 - tableDepth); //  
    sceneProperties.scene.add(tableMesh);
}

function updateBall(sceneProperties) {
    ball.x += ballDx;
    // ball.y += ballDy;
    ballMesh.position.x = ball.x;
    ballMesh.position.y = ball.y;   
    checkIfBallHitTopBottomTable();
    checkIfBallHitPaddle(leftPaddle, leftPaddleX);
    checkIfBallHitPaddle(rightPaddle, rightPaddleX);
    checkIfBallPassedPaddle(sceneProperties);
}

function checkIfBallHitTopBottomTable()
{
    if (ballMesh.position.y > tableHeight/2 || ballMesh.position.y < -tableHeight/2) {
      ballDy = -ballDy;
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
        ballDx = -ballDx;
    }
}

function checkIfBallPassedPaddle(sceneProperties) {
  if (ballMesh.position.x > tableWidth/2)
  {
      scorePlayer1++;
      sceneProperties.scene.remove(scorePlayer1Mesh);
      createP1ScoreText(sceneProperties);
      initBall(sceneProperties);
      if (scorePlayer1 === winningScore)
        scene2End(sceneProperties, sceneProperties.p1Name, sceneProperties.p1Colour);		
  }
  if (ballMesh.position.x < -tableWidth/2)
  {
   scorePlayer2++;      
    sceneProperties.scene.remove(scorePlayer2Mesh);
    createP2ScoreText(sceneProperties);
    initBall(sceneProperties);
      if (scorePlayer2 === winningScore)
        scene2End(sceneProperties, sceneProperties.p2Name, sceneProperties.p1Name);  		
  }
}

function updatePaddles() {
  leftPaddleMesh.position.y = leftPaddle.y;
  // rightPaddleMesh.position.y = rightPaddle.y;
  
  
    


  // if (rightPaddle.position.y + paddleHeight/2 < tableHeight/2) {
    // rightPaddle.y += paddleSpeed;
  // }
  // if (rightPaddle.position.y - paddleHeight/2 > -tableHeight/2) {
    // rightPaddle.y -= paddleSpeed;
  // }
}

function createP1ScoreText(sceneProperties) {
  const scorePlayer1Geom = new TextGeometry(scorePlayer1.toString(), {font: sceneProperties.font, size: scoreSize, height: scoreHeight});
  const scorePlayer1Material = new THREE.MeshPhongMaterial({color: sceneProperties.p1Colour});
  scorePlayer1Mesh = new THREE.Mesh(scorePlayer1Geom, scorePlayer1Material);
  scorePlayer1Mesh.position.x = leftScoreXpos;
  scorePlayer1Mesh.position.y = scoreYpos;
  sceneProperties.scene.add(scorePlayer1Mesh);
}

function createP2ScoreText(sceneProperties) {
  const scorePlayer2Geom = new TextGeometry(scorePlayer2.toString(), {font: sceneProperties.font, size: scoreSize, height: scoreHeight});
  const scorePlayer2Material = new THREE.MeshPhongMaterial({color: sceneProperties.p2Colour});
  scorePlayer2Mesh = new THREE.Mesh(scorePlayer2Geom, scorePlayer2Material);
  scorePlayer2Mesh.position.x = rightScoreXpos;
  scorePlayer2Mesh.position.y = scoreYpos;
  sceneProperties.scene.add(scorePlayer2Mesh);
}

function updateP1Score(sceneProperties) {

}

// HTML Button click event to trigger the WebSocket actions
document.getElementById("startGameButton").addEventListener("click", function () {
  // Call the function when the button is clicked
  scene2(sceneProperties);
});

// // KEYBOARD EVENTS CODE
// // listen to keyboard events to move the paddles
document.addEventListener("keydown", function (e) {
  // if (e.key === " ") {
  //     if (player !== 0) {
  //         e.preventDefault(); // Check for space bar key press
  //         gamePaused = !gamePaused; // Toggle game pause state
  //         sendGamePause();
  //     }
  //     return;
  // }

  // Player 1 controls (left paddle) - Arrow keys
  // if (player === 1) {
      // Up arrow key
      if (e.key === "ArrowUp") {
          if (leftPaddle.y + paddleHeight/2 < tableHeight/2) {
            paddleSpeed = 0.2;
            leftPaddle.y += paddleSpeed;
          }
          else {
            paddleSpeed = 0;
          }
          sendGameData();
      }
      // Down arrow key
      else if (e.key === "ArrowDown") {
          if (leftPaddle.y - paddleHeight/2 > -tableHeight/2) {
            paddleSpeed = -0.2;
          }
          else {
            paddleSpeed = 0;
          }          
          // sendGameData();
      }
  // }

//   // Player 2 controls (right paddle) - Arrow keys
//   // if (player === 2) {
//       console.log("Player 2 moving paddle");
//       // Up arrow key
//       if (e.key === "ArrowUp") {
//           rightPaddle.dy = -paddleSpeed;
//           sendGameData();
//       }
//       // Down arrow key
//       else if (e.key === "ArrowDown") {
//           rightPaddle.dy = paddleSpeed;
//           sendGameData();
//       }
//   // }
});


// listen to keyboard events to stop the paddle if key is released
document.addEventListener("keyup", function (e) {
  // Player 1 controls
  // if (player === 1) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          paddleSpeed = 0;
          // sendGameData();
      }
  // }

  // Player 2 controls
  // if (player === 2) {
      // if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      //     rightPaddle.dy = 0;
      //     sendGameData();
      // }
  // }
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

// function sendMatchInfo(mode) {
//   if (player === 0)
//     return;
// //  console.log("SendMatchInfo called");
//   var matchInfo = {
//     command: "match_info",
//     mode: mode,
//     score: {
//       player1: scorePlayer1,
//       player2: scorePlayer2,
//     },
//     winner: winner,
//   };

//   gameSocket.send(JSON.stringify(matchInfo));
// }

// function sendGamePause() {
//   console.log("SendGamePause called");
//   var gamePause = {
//     command: "gamePause",
//     gamePaused: gamePaused,
//   };

//   console.log("Sending data:", gamePause);

//   // Send the game data to the server via WebSocket
//   gameSocket.send(JSON.stringify(gamePause));
// }

function sendGameData() {
  if (player === 0)
    return;
//  console.log("SendGameData called");
  var gameData = {
    command: "update",
    leftPaddle: {
      y: leftPaddle.y,
      // dy: leftPaddle.dy,
    },
    rightPaddle: {
      y: rightPaddle.y,
      // dy: rightPaddle.dy,
    },
    ball: {
      x: ball.x,
      y: ball.y,
      // speed: ball.speed,
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
    //console.log("Parsed inner data:", data);

    // if (data.command === "set_player") {
    //   char_choice = data.player;
    //   console.log("set_player called");
    //   console.log("char_choice:", char_choice);
    // }

    if (data.command === "match_info") {
      if (data.mode === "start") {
        player1 = data.player1;
        player2 = data.player2;
        scorePlayer1 = 0;
        scorePlayer2 = 0;
        if (char_choice === player1) {
          player = 1;
        }
        else if (char_choice === player2) {
          player = 2;
        }
        else {
          player = 0;
          console.log("player set to 0");
        }
        console.log("STAGE: " + tournament_stage);
        startGame();
      }
      // else if (data.mode === "end") {
      //   console.log("reciving game END message");
      //   addLog("match END!, winner is " + data.winner, "match");
      // }
      // else if (data.mode === "update") {
      //   scorePlayer1 = data.score.player1;
      //   scorePlayer2 = data.score.player2;
      // }
    }

    // if (data.command === "tournament_info") {
    //   console.log("TOURNAMENT_info called");
    //   console.log("data:", data);
    //   addLog("TOURNAMENT INFO: " + event.data, "tournament");
    //   // Check if both players in the final match are set
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

    // Now you can access the properties correctly
    if (data.command === "update") {
      leftPaddle.y = data.leftPaddle.y;
      // leftPaddle.dy = data.leftPaddle.dy;
      rightPaddle.y = data.rightPaddle.y;
      // rightPaddle.dy = data.rightPaddle.dy;
      ball.x = data.ball.x;
      ball.y = data.ball.y;
      // ball.speed = data.ball.speed;
    }

    // if (data.command === "gamePause") {
    //   gamePaused = data.gamePaused;
    // }

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
    if (event.code === 3001 || event.code === 3002) {
      window.location.href = '/dashboard';
    }
    else if (event.code === 4001) {
      window.location.href = '/error/duplicate';
    }
    else if (event.code === 4002) {
      window.location.href = '/error/full';
    }
    else if (event.code === 4005 || event.code === 4006) {
      window.location.href = '/error/disconnection';
    }
  }, 1000); // 1000 milliseconds = 1 seconds
};

// Error handler for WebSocket errors
gameSocket.onerror = function (error) {
  console.error("WebSocket encountered an error: ", error);
  // Handle WebSocket errors
};

export {scene2};
