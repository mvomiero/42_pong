
/*******************************************************/
/******************* SENDING DATA **********************/
/*******************************************************/

// Function to add logs to the logs div
function addLog(message, elementId) {
  const logsDiv = document.getElementById(elementId);
  //logsDiv.innerHTML = `<p>${message}</p>`;
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
      player2: scorePlayer2,
    },
    winner: winner,
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

  // Send the game data to the server via WebSocket
  gameSocket.send(JSON.stringify(gamePause));
}

function sendGameData() {
  if (player === 0)
    return;
  console.log("SendGameData called");
  var gameData = {
    command: "update",
    //players: {
    //	scorePlayer1: scorePlayer1,
    //	scorePlayer2: scorePlayer2,
    //},
    leftPaddle: {
      x: leftPaddle.x,
      y: leftPaddle.y,
      dy: leftPaddle.dy,
    },
    rightPaddle: {
      x: rightPaddle.x,
      y: rightPaddle.y,
      dy: rightPaddle.dy,
    },
    ball: {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      resetting: ball.resetting,
      speed: ballSpeed,
    },
    // Include other relevant data if needed
  };

  //console.log("Sending data:", gameData);

  // Send the game data to the server via WebSocket
  gameSocket.send(JSON.stringify(gameData));
}


/*******************************************************/
/***************** RECEIVING DATA **********************/
/*******************************************************/

// Event handler for successful connection
/* gameSocket.onopen = function (event) {
  console.log("WebSocket connection opened!");
  console.log("ConnectionString: ", connectionString);
}; */

//gameSocket.onmessage = function (event) {
function handleWebSocketOpen(event) {
  try {
    //console.log("RECEIVED DATA:", event.data);
    var data = JSON.parse(event.data); // Parse the 'data' string within 'parsedData'
    //console.log("Parsed inner data:", data);

    if (data.command === "set_player") {
      char_choice = data.player;
      console.log("set_player called");
      console.log("char_choice:", char_choice);
    }

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
      else if (data.mode === "end") {
        ball.dx = 0;
        ball.dy = 0;
        ball.x = canvas.width - grid;
        ball.y = canvas.height / 2 - paddleHeight / 2;
        console.log("reciving game END message");
        sendGameData();
        addLog("match END!, winner is " + data.winner, "match");
      }
      else if (data.mode === "update") {
        scorePlayer1 = data.score.player1;
        scorePlayer2 = data.score.player2;
      }
    }

    if (data.command === "tournament_info") {
      console.log("TOURNAMENT_info called");
      console.log("data:", data);
      addLog("TOURNAMENT INFO: " + event.data, "tournament");
      // Check if both players in the final match are set
      console.log("data.matchFinal.player1: ", data.matchFinal.player1);
      console.log("data.matchFinal.player2: ", data.matchFinal.player2);
      if (data.matchFinal.player1 !== undefined && data.matchFinal.player2 !== undefined) {
        tournament_stage = "final";
      } else {
        tournament_stage = "semifinal";
      }
    }



    // Check if the received command is for broadcasting log messages
    // if (data.command === "broadcast_log") {
    //   if (data.message) {
    //     // Display the log message in the logs div using the addLog function
    //     addLog(data.message, data.elementId);
    //   }
    // }

    // Now you can access the properties correctly
    if (data.command === "update") {
      leftPaddle.x = data.leftPaddle.x;
      leftPaddle.y = data.leftPaddle.y;
      leftPaddle.dy = data.leftPaddle.dy;

      rightPaddle.x = data.rightPaddle.x;
      rightPaddle.y = data.rightPaddle.y;
      rightPaddle.dy = data.rightPaddle.dy;

      ball.x = data.ball.x;
      ball.y = data.ball.y;
      ball.dx = data.ball.dx;
      ball.dy = data.ball.dy;
      ball.resetting = data.ball.resetting;
      ball.ballSpeed = data.ball.speed;
    }

    if (data.command === "gamePause") {
      gamePaused = data.gamePaused;
    }

  } catch (error) {
    console.error("Error parsing received data:", error);
    console.log("Received data:", event.data);
    // Additional error handling or logging as needed
  }
};

// Event handler for connection closure
//gameSocket.onclose = function (event) {
function handleWebSocketClose(event) {
  console.log("WebSocket connection closed! (code: " + event.code + ")");
/*********************************************************/
/***************** CHANGES STARTING HERE *****************/
/*********************************************************/
  /* setTimeout(function () {
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
  }, 1000); */ // 1000 milliseconds = 1 seconds
/*********************************************************/
/****************** CHANGES ENDING HERE ******************/
/*********************************************************/
};

// Error handler for WebSocket errors
//gameSocket.onerror = function (error) {
function handleWebSocketError(error) {
  console.error("WebSocket encountered an error: ", error);
  // Handle WebSocket errors
};
