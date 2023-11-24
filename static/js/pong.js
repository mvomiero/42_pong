


const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;


var paddleSpeed = 6;
var ballSpeed = 2;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
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
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Websocket code
var roomCode = document.getElementById("game_board").getAttribute("room_code");
var char_choice = document.getElementById("game_board").getAttribute("char_choice");

var connectionString = 'ws://' + window.location.host + '/ws/play/' + roomCode + '/';
var gameSocket = new WebSocket(connectionString);

function sendGameData() {
    var gameData = {
        leftPaddle: {
            x: leftPaddle.x,
            y: leftPaddle.y,
            dy: leftPaddle.dy
        },
        rightPaddle: {
            x: rightPaddle.x,
            y: rightPaddle.y,
            dy: rightPaddle.dy
        },
        ball: {
            x: ball.x,
            y: ball.y,
            dx: ball.dx,
            dy: ball.dy
        }
        // Include other relevant data if needed
    };

    // Send the game data to the server via WebSocket
    gameSocket.send(JSON.stringify(gameData));
}

// Function to handle received game data
function receiveGameData(event) {
	const data = JSON.parse(event.data);
  
	// Update game variables based on received data
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
  
	// Additional handling if needed for other game elements...
  }

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
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
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {

  // up arrow key
  if (e.which === 38) {
    rightPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    rightPaddle.dy = paddleSpeed;
  }

  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
  sendGameData();
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
  sendGameData();
});

// Event handler for successful connection
gameSocket.onopen = function(event) {
    console.log("WebSocket connection opened!");
    // Perform actions after successful connection
};

// Event handler for receiving messages
gameSocket.onmessage = function(event) {
	try {
        var data = JSON.parse(event.data);
        // Update game variables based on received data
        // ... (your code to update game state)
    } catch (error) {
        console.error('Error parsing received data:', error);
        console.log('Received data:', event.data);
		print(event.data);
        // Additional error handling or logging as needed
    }
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
    // Process the received data

    // Example: Update game state based on received data
    // ...
};

// Event handler for connection closure
gameSocket.onclose = function(event) {
    if (event.wasClean) {
        console.log("WebSocket connection closed cleanly.");
    } else {
        console.error("WebSocket connection closed unexpectedly.");
    }
    // Perform cleanup tasks or display a message indicating connection closure
};

// Error handler for WebSocket errors
gameSocket.onerror = function(error) {
    console.error("WebSocket encountered an error: ", error);
    // Handle WebSocket errors
};

// start the game
requestAnimationFrame(loop);

