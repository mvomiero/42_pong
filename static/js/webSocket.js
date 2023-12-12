
/*******************************************************/
/******************* SENDING DATA **********************/
/*******************************************************/

// Function to add logs to the logs div
function addLog(message, elementId) {
    const logsDiv = document.getElementById(elementId);
    logsDiv.innerHTML = `<p>${message}</p>`;
  }

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





/*******************************************************/
/***************** RECEIVING DATA **********************/
/*******************************************************/

// Event handler for successful connection
gameSocket.onopen = function (event) {
    console.log("WebSocket connection opened!");
    console.log("ConnectionString: ", connectionString);
    // sendGameData();
    // updatePlayers();
    // sendLogMessage("Match: " + match, "match");
    // sendLogMessage("Scores " + scorePlayer1 + " : " + scorePlayer2, "scores");
  
  };

/****** to remove after server matchmaking integration:
        "update_players"
        "game_end"
         ******/
  
  gameSocket.onmessage = function (event) {
    try {
      var data = JSON.parse(event.data); // Parse the 'data' string within 'parsedData'
      //console.log("Parsed inner data:", data);

      if (data.command === "set_player") {
        char_choice = data.player;
      }

      if (data.command === "match_start") {
        player1 = data.player1;
        player2 = data.player2;
        if (char_choice === player1) {
          player = 1;
        }
        else if (char_choice === player2) {
          player = 2;
        }
        startGame();        
      }

      if (data.command === "match_info") {
        if (data.mode === "end") {
          ball.dx = 0;
          ball.dy = 0;
          ball.x = canvas.width - grid;
          ball.y = canvas.height / 2 - paddleHeight / 2;
          sendLogMessage("match END!, winner is " + data.winner, "match");
        }
        else if (data.mode === "update") {
          scorePlayer1 = data.score.player1;
          scorePlayer2 = data.score.player2;
        }
      }

  
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
                  // Wait for 4 seconds before changing ball speed and sending data
  
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
  
              // Create a new paragraph element
        const newParagraph = document.createElement('p');
  
        // Set the content of the paragraph
        newParagraph.textContent = 'Game over!';
  
        // Replace the canvas with the new paragraph
        canvas.parentNode.replaceChild(newParagraph, canvas);
  
        // Redirect to another page after a short delay (e.g., 2 seconds)
        // setTimeout(function () {
        //   window.location.href = "/dashboard/"; // Replace '/path/to/another/page' with the desired URL
        // }, 500); // 2000 milliseconds = 2 seconds
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
      if (event.code === 507) {
      // Redirect to another page when the server closes the connection with code 507 (Insufficient Storage)
      window.location.href = 'error/full'; // Replace with your desired URL
      }
  
    // Perform cleanup tasks or display a message indicating connection closure
  };
  
  // Error handler for WebSocket errors
  gameSocket.onerror = function (error) {
    console.error("WebSocket encountered an error: ", error);
    // Handle WebSocket errors
  };
  