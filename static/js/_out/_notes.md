# approach



# canvas - how will i handle them?

# keys events
- pressing keys to move the paddles triggers the gameUpdate event which sends the position to the other player
- this is done in keyboardEvents.js

gameStart is called
space can be used to pause (pausing means ball stops moving - paddles can still be moved - message is sent to other player to also pause)
whenever you move a paddle gameUpdate is called

# objects for elements
there is an object for each element i.e. ball, bats. Keep this structure!
const leftPaddle = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,
  dy: 0,
};
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: grid,
    height: grid,
    resetting: false,
    dx: 0,
    dy: 0,
    speed: ballSpeed,
};

// in the webSocket.js, game data is sent and the paddle and ball positions are updated for both players!

function sendGameData() {
  if (player === 0)
    return;
  console.log("SendGameData called");
  var gameData = {
    command: "update",
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
  };

# resetting the ball position when a point is scored
when a point is scored, we call gameUpdate and the ball resets for both players

#

'command': 'update', 'leftPaddle': {'x': 0, 'y': 255, 'dy': 0}, 'rightPaddle': {'x': 735, 'y': 159, 'dy': -6}, 'ball': {'x': 755, 'y': 115, 'dx': 5, 'dy': 5, 'resetting': True, 'speed': 5}