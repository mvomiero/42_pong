
{/* <script src="pong.js"></script> */}

// listen to keyboard events to move the paddles
document.addEventListener("keydown", function (e) {
    // Player 1 controls (left paddle) - Arrow keys
    if (player === 1) {
        console.log("Player 1 moving paddle");
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
        console.log("Player 2 moving paddle");
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

// HTML Button click event to trigger the WebSocket actions
document.getElementById("startGameButton").addEventListener("click", function() {
    // Call the function when the button is clicked
    startGame();
});
  
// Listen to keyboard events to pause/resume the game
document.addEventListener("keydown", function (e) {
    if (e.key === " ") {
        if (player !== 0)
        {
            e.preventDefault(); // Check for space bar key press
            gamePaused = !gamePaused; // Toggle game pause state
            sendGamePause();
        }
    }
});
  