


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

var player = 0;
var player1 = '';
var player2 = '';
let players_set = false;

function updatePlayers() {
	console.log('UPDATEPLAYERS called');
	var Data = {
		command: 'update_players',
		players: {
			player: char_choice,
			player1: player1,
			player2: player2,
			//players_set: players_set,
		}
	};
	console.log('Updaate players Sending data:', Data);
	gameSocket.send(JSON.stringify(Data));
}

function sendGameData() {
	console.log('SendGameData called');
    var gameData = {
		command: 'update',
		//players: {
		//	player: char_choice,
		//	player1: player1,
		//	player2: player2,
		//},
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

	console.log('Sending data:', gameData);

    // Send the game data to the server via WebSocket
    gameSocket.send(JSON.stringify(gameData));
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
  console.log('player1:', player1);
	console.log('player2:', player2);
	console.log('player:', player);
  sendGameData();

});

// Event handler for successful connection
gameSocket.onopen = function(event) {
    console.log("WebSocket connection opened!");
	// Call sendGameData() after establishing the WebSocket connection
	sendGameData();
	updatePlayers();
    // Perform actions after successful connection
};

gameSocket.onmessage = function(event) {
    try {
		var data = JSON.parse(event.data); // Parse the 'data' string within 'parsedData'
		console.log("Parsed inner data:", data);

		if (data.command === 'update') {
			console.log('the command is to update!');
		}

		//console.log('char_choice:', char_choice);
		//console.log('data.players.player:', data.players.player);

		if (data.command === 'update_players') {

			if (player1 !== '' && player2 !== '' && player1 !== player2) {
				console.log('PLAYERS SET!');
				console.log('player1:', player1);
				console.log('player2:', player2);
				return;
			}
			if (data.players.player !== char_choice) {
				console.log('UPDATING PLAYERS!');
				player1 = char_choice;
				player2 = data.players.player;
				player = 1;
				updatePlayers();
			}
			if (data.players.player1 !== '' && data.players.player2 !== '') {
				console.log('UPDATING PLAYERS SAME!');
				player1 = data.players.player1;
				player2 = data.players.player2;
				player = 2;
			}
		}
		console.log('player1:', player1);
		console.log('player2:', player2);
		console.log('player:', player);



        // Now you can access the properties correctly
		if (data.command === 'update') {
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
		}

        // Process the received data
        // Example: Update game state based on received data
        // ...
    } catch (error) {
        console.error('Error parsing received data:', error);
        console.log('Received data:', event.data);
        // Additional error handling or logging as needed
    }
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

