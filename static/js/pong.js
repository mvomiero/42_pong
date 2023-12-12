// Fold all --> Ctrl + K + 0
// Unfold all --> Ctrl + K + J
// Fold current --> Ctrl + ]
// Unfold current --> Ctrl + [

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;

var paddleSpeed = 6;
var ballSpeed = 3;

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




// Websocket code
var roomCode = document.getElementById("game_board").getAttribute("room_code");
char_choice = document
                    .getElementById("game_board")
                    .getAttribute("char_choice");
var char_choice;

var connectionString =
  "ws://" + window.location.host + "/ws/play/" + roomCode + "/" + char_choice + "/";
console.log("connectionString: ", connectionString);
var gameSocket = new WebSocket(connectionString);

var player = 0;
var player1 = "";
var player2 = "";
var scorePlayer1 = 0;
var scorePlayer2 = 0;

var winner = "";
const winningScore = 2;

var match = 1;

var gamePaused = false; // Variable to track game pause state



// Function to start the countdown
function startCountdown() {
  console.log("startCountdown called!");
  let countdown = 3; // Initial countdown number

  // Initial display of countdown number
  sendLogMessage(countdown > 0 ? countdown : '', "countdownText");

  // Display the countdown at intervals of 1 second
  const countdownInterval = setInterval(() => {
    countdown--; // Decrement the countdown

    if (countdown > 0) {
      sendLogMessage(countdown, "countdownText");
    } else if (countdown === 0) {
      sendLogMessage('GO!', "countdownText");
    } else {
      sendLogMessage(' ', "countdownText");
      clearInterval(countdownInterval); // Stop the countdown when it reaches 1
    }
  }, 1000); // 1 second interval
}

function startGame() {
  console.log("startGamefunction called!");
  sendGameData();
  // player don't need to be updated since it is handled from the backend
  //updatePlayers(); 
  startCountdown();
  
  // Wait for 4 seconds before changing ball speed and sending data
  setTimeout(() => {
    ball.dx = ball.ballSpeed;
    ball.dy = -ball.ballSpeed;
    sendGameData();
    sendScoreData();
  }, 4000); // 4000 milliseconds = 4 seconds
  
  sendLogMessage("Match: " + match, "match");
  sendLogMessage("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");
}

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

    if (scorePlayer1 >= winningScore || scorePlayer2 >= winningScore) {
      if (scorePlayer1 > scorePlayer2) {
        winner = player1;
        sendLogMessage("Player 1 wins the match " + match, "logs");
        sendLogMessage("Match: " + match, "match");
      } else if (scorePlayer1 < scorePlayer2) {
        winner = player2;
        sendLogMessage("Player 2 wins the match " + match, "logs");
        sendLogMessage("Match: " + match, "match");
      } else {
        sendLogMessage("It's a tie!", "logs");
      }
      scorePlayer1 = 0;
      scorePlayer2 = 0;
      match++;

      if (match > 1) {
        sendLogMessage("Game over!", "logs");
        sendMatchInfo("update");
        sendMatchEnd("end");
        //sendGameEnd();
      }
    }

    sendMatchInfo("update");

    //sendScoreData();
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

// start the game
requestAnimationFrame(loop);
