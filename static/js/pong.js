const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;

var paddleSpeed = 6;
var ballSpeed = 2;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0,
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0,
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: 0,
  dy: 0,
  speed: ballSpeed,
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Function to add logs to the logs div
function addLog(message, elementId) {
  const logsDiv = document.getElementById(elementId);
  logsDiv.innerHTML = `<p>${message}</p>`;
}

// Websocket code
var roomCode = document.getElementById("game_board").getAttribute("room_code");
var char_choice = document
  .getElementById("game_board")
  .getAttribute("char_choice");

var connectionString =
  "ws://" + window.location.host + "/ws/play/" + roomCode + "/";
var gameSocket = new WebSocket(connectionString);

var player = 0;
var player1 = "";
var player2 = "";
var scorePlayer1 = 0;
var scorePlayer2 = 0;

var match = 1;

var gamePaused = false; // Variable to track game pause state

function updatePlayers() {
  console.log("UPDATEPLAYERS called");
  var Data = {
    command: "update_players",
    players: {
      player: char_choice,
      player1: player1,
      player2: player2,
    },
  };
  console.log("Updaate players Sending data:", Data);
  gameSocket.send(JSON.stringify(Data));
}

// Function to send log messages to the server
function sendLogMessage(message, elementId) {
  const logData = {
    command: "broadcast_log",
    message: message,
    elementId: elementId,
  };
  console.log("Sending log message:", logData);
  gameSocket.send(JSON.stringify(logData));
}

function sendScoreData() {
  console.log("SendScoreData called");
  var scoreData = {
    command: "updateScore",
    players: {
      scorePlayer1: scorePlayer1,
      scorePlayer2: scorePlayer2,
      match: match,
    },
  };

  console.log("Sending data:", scoreData);

  // Send the game data to the server via WebSocket
  gameSocket.send(JSON.stringify(scoreData));
  sendLogMessage("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");
}

function sendGameEnd() {
  console.log("SendGameEnd called");
  var gameEnd = {
    command: "gameEnd",
  };

  console.log("Sending data:", gameEnd);

  // Send the game data to the server via WebSocket
  gameSocket.send(JSON.stringify(gameEnd));
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
  //console.log("SendGameData called");
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



// Listen to keyboard events to pause/resume the game
document.addEventListener("keydown", function (e) {
  if (e.key === " ") { // Check for space bar key press
	gamePaused = !gamePaused; // Toggle game pause state
	sendGamePause();
  }
});

// game loop
function loop() {
	requestAnimationFrame(loop);
  //requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  } else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  } else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = "white";
  context.fillRect(
    leftPaddle.x,
    leftPaddle.y,
    leftPaddle.width,
    leftPaddle.height
  );
  context.fillRect(
    rightPaddle.x,
    rightPaddle.y,
    rightPaddle.width,
    rightPaddle.height
  );

  // move ball by its velocity
  if (!gamePaused) {
  ball.x += ball.dx;
  ball.y += ball.dy;
  }

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  } else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // reset ball if it goes past left or right edge
    if (ball.x < 0) {
      // Ball passed the left edge, player 2 scores
      scorePlayer2++;
    } else if (ball.x > canvas.width) {
      // Ball passed the right edge, player 1 scores
      scorePlayer1++;
      console.log("SCORE!! Player 1 score: " + scorePlayer1);
    }

    if (scorePlayer1 >= 2 || scorePlayer2 >= 2) {
      if (scorePlayer1 > scorePlayer2) {
        sendLogMessage("Player 1 wins the match " + match, "logs");
        sendLogMessage("Match: " + match, "match");
      } else if (scorePlayer1 < scorePlayer2) {
        sendLogMessage("Player 2 wins the match " + match, "logs");
        sendLogMessage("Match: " + match, "match");
      } else {
        sendLogMessage("It's a tie!", "logs");
      }
      scorePlayer1 = 0;
      scorePlayer2 = 0;
      match++;

      if (match > 2) {
        sendLogMessage("Game over!", "logs");
        sendGameEnd();
      }
    }

    sendScoreData();
    sendGameData();

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      sendGameData();
    }, 800);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  } else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // Call sendGameData() after updating the game state
  //sendGameData();

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = "lightgrey";
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}


// listen to keyboard events to move the paddles
document.addEventListener("keydown", function (e) {
  // Player 1 controls (left paddle) - Arrow keys
  if (player === 1) {
    // Up arrow key
    if (e.key === "ArrowUp") {
      leftPaddle.dy = -paddleSpeed;
    }
    // Down arrow key
    else if (e.key === "ArrowDown") {
      leftPaddle.dy = paddleSpeed;
    }
  }

  // Player 2 controls (right paddle) - Arrow keys
  if (player === 2) {
    // Up arrow key
    if (e.key === "ArrowUp") {
      rightPaddle.dy = -paddleSpeed;
    }
    // Down arrow key
    else if (e.key === "ArrowDown") {
      rightPaddle.dy = paddleSpeed;
    }
  }

  sendGameData();
});



// listen to keyboard events to stop the paddle if key is released
document.addEventListener("keyup", function (e) {
  // Player 1 controls
  if (player === 1) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      leftPaddle.dy = 0;
    }
  }

  // Player 2 controls
  if (player === 2) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      rightPaddle.dy = 0;
    }
  }

  sendGameData();
});





// Event handler for successful connection
gameSocket.onopen = function (event) {
  console.log("WebSocket connection opened!");
  // Call sendGameData() after establishing the WebSocket connection
  sendGameData();
  updatePlayers();
  sendLogMessage("Match: " + match, "match");
  sendLogMessage("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");
  //sendLogMessage("Player " + char_choice + ", id = " + player + " has joined the game!");
  // Perform actions after successful connection
};

gameSocket.onmessage = function (event) {
  try {
    var data = JSON.parse(event.data); // Parse the 'data' string within 'parsedData'
    //console.log("Parsed inner data:", data);

    if (data.command === "update_players") {
      if (player1 === "" && player2 === "") {
        sendLogMessage(
          "Player " + char_choice + ", id = " + 1 + " has joined the game!",
          "logs"
        );
      }
      if (player1 !== "" && player2 !== "" && player1 !== player2) {
        console.log("PLAYERS SET!");
        console.log("player1:", player1);
        console.log("player2:", player2);
        return;
      }
      if (data.players.player !== char_choice) {
        console.log("UPDATING PLAYERS!");
        player1 = char_choice;
        player2 = data.players.player;
        player = 1;
        updatePlayers();
      }
      if (data.players.player1 !== "" && data.players.player2 !== "") {
        console.log("UPDATING PLAYERS SAME!");
        player1 = data.players.player1;
        player2 = data.players.player2;
        player = 2;
        sendLogMessage(
          "Player " +
            char_choice +
            ", id = " +
            player +
            " has joined the game!\n" +
            "<p> Player 1 is " +
            data.players.player1 +
            " and Player 2 is " +
            data.players.player2 +
            "</p>",
          "logs"
        );
        ball.dx = ball.ballSpeed;
        ball.dy = -ball.ballSpeed;
        sendGameData();
        sendScoreData();
      }
    }
    //console.log("player1:", player1);
    //console.log("player2:", player2);
    //console.log("player:", player);

    // Check if the received command is for broadcasting log messages
    if (data.command === "broadcast_log") {
      if (data.message) {
        // Display the log message in the logs div using the addLog function
        addLog(data.message, data.elementId);
      }
    }

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

    if (data.command === "updateScore") {
      scorePlayer1 = data.players.scorePlayer1;
      scorePlayer2 = data.players.scorePlayer2;
      match = data.players.match;
    }

    if (data.command === "gameEnd") {
      gameSocket.close();

      // Redirect to another page after a short delay (e.g., 2 seconds)
      setTimeout(function () {
        window.location.href = "/dashboard/"; // Replace '/path/to/another/page' with the desired URL
      }, 500); // 2000 milliseconds = 2 seconds
    }

	if (data.command === "gamePause") {
		gamePaused = data.gamePaused;
	}


    // Process the received data
    // Example: Update game state based on received data
    // ...
  } catch (error) {
    console.error("Error parsing received data:", error);
    console.log("Received data:", event.data);
    // Additional error handling or logging as needed
  }
};

// Event handler for connection closure
gameSocket.onclose = function (event) {
  if (event.wasClean) {
    console.log("WebSocket connection closed cleanly.");
  } else {
    console.error("WebSocket connection closed unexpectedly.");
  }
  // Perform cleanup tasks or display a message indicating connection closure
};

// Error handler for WebSocket errors
gameSocket.onerror = function (error) {
  console.error("WebSocket encountered an error: ", error);
  // Handle WebSocket errors
};

// start the game
requestAnimationFrame(loop);
