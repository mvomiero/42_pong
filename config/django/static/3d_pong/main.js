import * as THREE from 'three';
import { FontLoader } from 'three/FontLoader';
import { TextGeometry } from 'three/TextGeometry';
import { OrbitControls } from 'three/OrbitControls';

const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.138.3/examples/fonts/droid/droid_serif_regular.typeface.json', function (font) {
  const canvas = document.getElementById("gameCanvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const light = new THREE.PointLight(0xffddaa, 1.3, 150);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(canvas.width, canvas.height);
  const zoomFactor = 0.027;
  let sceneProperties = {
    canvas: canvas,
    scene: scene,
    camera: camera,
    renderer: renderer,
    zoomedCanvasWidth: canvas.width * zoomFactor,
    zoomedCanvasHeight: canvas.height * zoomFactor,
    backgroundColour: 0x000000,
    p1Colour: 0xb744ff,
    otherTextColour: 0xFFFFAA,
    p2Colour: 0xff00a2,
    ballColour: 0x00eaff,
    tableColour: 0x001aff,
    tableWallsColour: 0x001aff,
    font: font,
  };
  sceneProperties.scene.background = new THREE.Color(sceneProperties.backgroundColour);
  light.position.set(0, 0, 12);
  sceneProperties.scene.add(light);

  var player1Score = 0, player2Score = 0;
  const ball = {};
  var tableMesh, tableUpperWallMesh, tableLowerWallMesh, netMesh, tableWidth, tableHeight, tableDepth;
  var ballMesh, ballSize = 0.2, minBallZ, maxBallZ;
  var leftPaddleMesh, rightPaddleMesh, paddleWidth, paddleHeight, paddleDepth;
  var paddleIncreaseKey, paddleDecreaseKey;
  var textHeight, textDepth, textYpos, leftScoreXpos, rightScoreXpos, leftNameOffset, rightNameOffset;
  var player1ScoreMesh, player2ScoreMesh, namePlayer1Mesh, namePlayer2Mesh;
  var controls;
  var player1, player2;
  var player = 0;
  var char_choice;
  var gameSocket;
  var paddleCam = false;

  // variables for message at the end of the game:
  var winMessage = {
    player: undefined,
    game_mode: undefined,
    winner: undefined, // match only
    ranking: { // tournament only
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined
    }
  }


  /**************************************************/
  /******************** NEW PART ********************/
  /**************************************************/

  // Function to show the name input field
  function showNameInput() {
    document.getElementById('pongChooseMode').style.display = 'none';
    document.getElementById('nameInputSection').style.display = 'block';
  }

  function displayPlayerAndMode(player, mode) {
    document.getElementById('player_info').innerHTML = "Player: " + player;
    document.getElementById('game_info').style.display = 'inline-flex';
    document.getElementById('mode_info').innerHTML = "Mode: " + mode;
    document.getElementById('game_message').style.display = 'block';
  }

  // Function to show the canvas after submitting the name
  function submitNameAndStartGame() {
    const playerName = document.getElementById('playerName').value.trim();  // Get the player name and remove leading and trailing whitespace
    if (playerName !== '' && playerName.length <= 10) { // Check if name is not empty and has max 10 characters
      document.getElementById('nameInputSection').style.display = 'none';
      document.getElementById('game_board').style.display = 'block';
      var roomCode = document.getElementById("room_code").value;
      winMessage.player = playerName;
      winMessage.game_mode = roomCode;
      char_choice = playerName;
      var connectionString =
        "wss://" + window.location.host + "/ws/play/" + roomCode + "/" + char_choice + "/";
      gameSocket = new WebSocket(connectionString);
      console.log("[WebSocket started] connectionString: ", connectionString);
      displayPlayerAndMode(char_choice, roomCode);
      document.getElementById('message_info').innerHTML = "Info: Waiting for opponent to connect...";
      initGame();
      gameSocket.onmessage = handleWebSocketOpen;
      gameSocket.onclose = handleWebSocketClose;
      gameSocket.onerror = handleWebSocketError;

    } else if (playerName.length > 10) {
      alert('Name too long - Please enter a valid name.');
    } else {
      alert('Please enter a valid name.');
    }
  }

  // Function to show the name input field
  function showNameInput2() {
    document.getElementById('restartPongSection').style.display = 'none';
    document.getElementById('pongChooseMode').style.display = 'block';
  }

  document.getElementById('startRemoteGameButton').addEventListener('click', showNameInput);
  document.getElementById('submitNameButton').addEventListener('click', submitNameAndStartGame);
  document.getElementById('restartGameButton').addEventListener('click', showNameInput2);

  // // Function to check if an element is in the viewport
  // function isInViewport(element) {
  //   const rect = element.getBoundingClientRect();
  //   return (
  //     rect.top >= 0 &&
  //     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  //   );
  // }

  /**************************************************/
  /**************** END NEW PART ********************/
  /**************************************************/

  function initGame() {
    initCamera();
    initTable();
    createTable();
    paddleWidth = sceneProperties.zoomedCanvasWidth * 0.02;
    paddleHeight = tableHeight / 4; // must match with self.height = 1/5 in consumers.py
    paddleDepth = sceneProperties.zoomedCanvasHeight * 0.05;
    minBallZ = ballSize * 0.7;
    maxBallZ = sceneProperties.zoomedCanvasWidth * 0.075;
    renderer.render(scene, camera);
  }

  function initCamera() {
    controls = new OrbitControls(sceneProperties.camera, sceneProperties.renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when damping is enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minAzimuthAngle = -Math.PI / 2; // left limit
    controls.maxAzimuthAngle = Math.PI / 2; // right limit
    controls.maxPolarAngle = Math.PI / 1; // vertical rotation limit
    var onWindowResize = function () { // Handle resize events
      sceneProperties.camera.aspect = window.innerWidth / window.innerHeight;
      sceneProperties.camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onWindowResize, false);
    setNormalCam();
  }

  // normalCam, paddleCam

  function setNormalCam() {
    paddleCam = false
    controls.enabled = true;
    paddleIncreaseKey = "W";
    paddleDecreaseKey = "S";
    sceneProperties.camera.position.set(0, 0, 11);
    sceneProperties.camera.rotation.set(0, 0, 0);
  }

  function setPaddleCam(player) {
    const halfPaddleDepth = paddleDepth / 2;
    if (player === 1) {
      paddleCam = true
      controls.enabled = false;
      paddleIncreaseKey = "A";
      paddleDecreaseKey = "D";
      sceneProperties.camera.position.set(leftPaddleMesh.position.x, leftPaddleMesh.position.y, halfPaddleDepth);
      sceneProperties.camera.rotation.set(Math.PI / 2, -Math.PI / 2, 0);
    }
    if (player === 2) {
      paddleCam = true
      controls.enabled = false;
      paddleIncreaseKey = "D";
      paddleDecreaseKey = "A";
      sceneProperties.camera.position.set(rightPaddleMesh.position.x, rightPaddleMesh.position.y, halfPaddleDepth);
      sceneProperties.camera.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    } 
  }

  function updatePaddleCam() {
    const halfPaddleDepth = paddleDepth / 2;
    if (paddleCam)
      if (player === 1)
        sceneProperties.camera.position.set(leftPaddleMesh.position.x, leftPaddleMesh.position.y, halfPaddleDepth);
      else if (player === 2)
        sceneProperties.camera.position.set(rightPaddleMesh.position.x, rightPaddleMesh.position.y, halfPaddleDepth);
  }

  function setPaddleCamForLeadingPlayer() {
    if (player1Score > player2Score) {
      if (player === 1)
        setPaddleCam(player);
      if (player === 2)
        setNormalCam();
    }
    else if (player1Score < player2Score) {
      if (player === 1)
        setNormalCam();
      if (player === 2)
        setPaddleCam(player);
    }
    else if (player1Score == player2Score) {
      setNormalCam(); // both players
    }
  }

  // CONSTRUCTION OF MESHES

  function initTable() {
    tableWidth = sceneProperties.zoomedCanvasWidth * 0.75;
    tableHeight = sceneProperties.zoomedCanvasHeight * 0.75;
    tableDepth = sceneProperties.zoomedCanvasHeight * 0.01;
  }

  function initTextParams() {
    textHeight = sceneProperties.zoomedCanvasHeight * 0.075;
    textDepth = sceneProperties.zoomedCanvasHeight * 0.01;
    textYpos = sceneProperties.zoomedCanvasHeight * 0.38;
    leftScoreXpos = (sceneProperties.zoomedCanvasWidth * 0.08) - (sceneProperties.zoomedCanvasWidth / 2);
    rightScoreXpos = (sceneProperties.zoomedCanvasWidth * 0.87) - (sceneProperties.zoomedCanvasWidth / 2);
    leftNameOffset = sceneProperties.zoomedCanvasWidth * 0.08;
    rightNameOffset = sceneProperties.zoomedCanvasWidth * 0.04;
  }

  function createBall() {
    var geometry = new THREE.SphereGeometry(ballSize, 50);
    var material = new THREE.MeshPhongMaterial({ color: sceneProperties.ballColour });
    ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.set(0, 0, ballSize);
    sceneProperties.scene.add(ballMesh);
  }

  function createLeftPaddle() {
    var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    var leftPaddleMeshMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.p1Colour });
    leftPaddleMesh = new THREE.Mesh(paddleGeometry, leftPaddleMeshMaterial);
    const halfPaddleDepth = paddleDepth / 2;
    leftPaddleMesh.position.set(-tableWidth / 2 - paddleWidth / 2, 0, halfPaddleDepth);
    sceneProperties.scene.add(leftPaddleMesh);
  }

  function createRightPaddle() {
    var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    var rightPaddleMeshMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.p2Colour });
    rightPaddleMesh = new THREE.Mesh(paddleGeometry, rightPaddleMeshMaterial);
    const halfPaddleDepth = paddleDepth / 2;
    rightPaddleMesh.position.set(tableWidth / 2 + paddleWidth / 2, 0, halfPaddleDepth);
    sceneProperties.scene.add(rightPaddleMesh);
  }

  function createTable() {
    var tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    var tableMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.tableColour });
    tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    const halfTableDepth = tableDepth / 2;
    tableMesh.position.set(0, 0, halfTableDepth);
    sceneProperties.scene.add(tableMesh);

    var tableWallGeometry = new THREE.BoxGeometry(tableWidth, sceneProperties.zoomedCanvasHeight * 0.02, maxBallZ);
    var tableWallMaterial = new THREE.MeshPhongMaterial({
      color: sceneProperties.tableWallsColour,
      opacity: 0.5,
      transparent: true
    });
    tableUpperWallMesh = new THREE.Mesh(tableWallGeometry, tableWallMaterial);
    const tableUpperWallWidth = 0;
    const tableUpperWallHeight = tableHeight / 2;
    const tableUpperWallDepth = maxBallZ;
    tableUpperWallMesh.position.set(tableUpperWallWidth, tableUpperWallHeight, tableUpperWallDepth / 2);
    sceneProperties.scene.add(tableUpperWallMesh);

    tableLowerWallMesh = new THREE.Mesh(tableWallGeometry, tableWallMaterial);
    const tableLowerWallWidth = 0;
    const tableLowerWallHeight = -tableHeight / 2;
    const tableLowerWallDepth = maxBallZ;
    tableLowerWallMesh.position.set(tableLowerWallWidth, tableLowerWallHeight, tableLowerWallDepth / 2);
    sceneProperties.scene.add(tableLowerWallMesh);

    const netMeshWidth = sceneProperties.zoomedCanvasWidth * 0.015;
    const netMeshHeight = tableHeight * 0.9;
    const netMeshDepth = tableDepth * 5;
    var netGeometry = new THREE.BoxGeometry(netMeshWidth, netMeshHeight, netMeshDepth);
    var netMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      opacity: 0.1,
      transparent: true
    });

    netMesh = new THREE.Mesh(netGeometry, netMaterial);
    var halfNetMeshDepth = netMeshDepth / 2;
    netMesh.position.set(0, 0, halfNetMeshDepth);
    sceneProperties.scene.add(netMesh);
  }

  function createP1ScoreText() {
    const player1ScoreGeom = new TextGeometry(player1Score.toString(), { font: sceneProperties.font, size: textHeight, height: textDepth });
    const player1ScoreMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.p1Colour });
    player1ScoreMesh = new THREE.Mesh(player1ScoreGeom, player1ScoreMaterial);
    const p1ScoreTextWidth = leftScoreXpos;
    const p1ScoreTextHeight = textYpos - textHeight;
    const p1ScoreTextDepth = maxBallZ;
    player1ScoreMesh.position.set(p1ScoreTextWidth, p1ScoreTextHeight, p1ScoreTextDepth);
    sceneProperties.scene.add(player1ScoreMesh);
  }

  function createP2ScoreText() {
    const player2ScoreGeom = new TextGeometry(player2Score.toString(), { font: sceneProperties.font, size: textHeight, height: textDepth });
    const player2ScoreMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.p2Colour });
    player2ScoreMesh = new THREE.Mesh(player2ScoreGeom, player2ScoreMaterial);
    const p2ScoreTextWidth = rightScoreXpos;
    const p2ScoreTextHeight = textYpos - textHeight;
    const p2ScoreTextDepth = maxBallZ;
    player2ScoreMesh.position.set(p2ScoreTextWidth, p2ScoreTextHeight, p2ScoreTextDepth);
    sceneProperties.scene.add(player2ScoreMesh);
  }

  function createP1NameText() {
    const namePlayer1Geom = new TextGeometry(player1, { font: sceneProperties.font, size: textHeight, height: textDepth });
    const namePlayer1Material = new THREE.MeshPhongMaterial({ color: sceneProperties.p1Colour });
    namePlayer1Mesh = new THREE.Mesh(namePlayer1Geom, namePlayer1Material);
    const namePlayer1MeshWidth = leftScoreXpos + leftNameOffset;
    const namePlayer1MeshHeight = textYpos - textHeight;
    const namePlayer1MeshDepth = maxBallZ;
    namePlayer1Mesh.position.set(namePlayer1MeshWidth, namePlayer1MeshHeight, namePlayer1MeshDepth);
    sceneProperties.scene.add(namePlayer1Mesh);
  }

  function createP2NameText() {
    const namePlayer2Geom = new TextGeometry(player2, { font: sceneProperties.font, size: textHeight, height: textDepth });
    const namePlayer2Material = new THREE.MeshPhongMaterial({ color: sceneProperties.p2Colour });
    namePlayer2Mesh = new THREE.Mesh(namePlayer2Geom, namePlayer2Material);
    const boundingBox = new THREE.Box3().setFromObject(namePlayer2Mesh);
    const lengthX = boundingBox.max.x - boundingBox.min.x;
    const namePlayer2MeshWidth = rightScoreXpos - rightNameOffset - lengthX;
    const namePlayer2MeshHeight = textYpos - textHeight;
    const namePlayer2MeshDepth = maxBallZ;
    namePlayer2Mesh.position.set(namePlayer2MeshWidth, namePlayer2MeshHeight, namePlayer2MeshDepth);
    sceneProperties.scene.add(namePlayer2Mesh);
  }

  // DESTRUCTION OF MESHES

  function removeElements() {
    removeAndDisposeAndMakeUndefined(ballMesh);
    removeAndDisposeAndMakeUndefined(player1ScoreMesh);
    removeAndDisposeAndMakeUndefined(player2ScoreMesh);
    removeAndDisposeAndMakeUndefined(namePlayer1Mesh);
    removeAndDisposeAndMakeUndefined(namePlayer2Mesh);
    removeAndDisposeAndMakeUndefined(leftPaddleMesh);
    removeAndDisposeAndMakeUndefined(rightPaddleMesh);
    removeAndDisposeAndMakeUndefined(tableMesh);
    removeAndDisposeAndMakeUndefined(tableUpperWallMesh);
    removeAndDisposeAndMakeUndefined(tableLowerWallMesh);
    removeAndDisposeAndMakeUndefined(netMesh);
    removeAndDisposeAndMakeUndefined(controls);
    renderer.render(scene, camera);
    document.removeEventListener("keydown", keyDownEventListener);
    document.removeEventListener("keyup", keyUpEventListener);
  }

  function removeAndDisposeAndMakeUndefined(object) {
    if (!object)
      return;
    sceneProperties.scene.remove(object);
    if (object.geometry)
      object.geometry.dispose();
    if (object.material) {
      if (object.material.map)
        object.material.map.dispose();
      object.material.dispose();
    }
    object = undefined;
  }

  // UTILITY FUNCTIONS

  function scaleFloatToRange(floatValue, minRange, maxRange) {
    floatValue = Math.max(0, Math.min(1, floatValue));
    return (maxRange - minRange) * floatValue + minRange;
  }

  // KEYBOARD EVENTS
  function keyDownEventListener(e) {
    if (e.key.toLowerCase() === paddleIncreaseKey.toLowerCase())
      gameSocket.send(JSON.stringify({command: "move_paddle", direction: "up", action: "pressed"}));
    else if (e.key.toLowerCase() === paddleDecreaseKey.toLowerCase())
      gameSocket.send(JSON.stringify({command: "move_paddle", direction: "down", action: "pressed"}));
  }

  function keyUpEventListener(e) {
    if (e.key.toLowerCase() === paddleIncreaseKey.toLowerCase())
      gameSocket.send(JSON.stringify({command: "move_paddle", direction: "up", action: "released"}));
    else if (e.key.toLowerCase() === paddleDecreaseKey.toLowerCase())
      gameSocket.send(JSON.stringify({command: "move_paddle", direction: "down", action: "released"}));
  }

  // RECEIVING DATA

  function displayTournamentMatches(data) {
    document.getElementById('tournament_info').style.display = 'inline-flex';
    document.getElementById('semiFinal1').innerHTML = data.matchSemi1.player1 + " vs. " + data.matchSemi2.player2;
    document.getElementById('semiFinal2').innerHTML = data.matchSemi2.player1 + " vs. " + data.matchSemi2.player2;

    if (data.matchFinal.player1 === undefined || data.matchFinal.player2 === undefined)
      document.getElementById('final').innerHTML = "Not yet started";
    else
      document.getElementById('final').innerHTML = data.matchFinal.player1 + " vs. " + data.matchFinal.player2;
  }

  function handleWebSocketOpen(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.command != "match_data")
        console.log("Received data:", data);

      if (data.command === "set_player") {
        createLeftPaddle();
        renderer.render(scene, camera);
        char_choice = data.player;
      }

      if (data.command === "match_info") {
        if (data.mode === "start") {
          document.getElementById('message_info').style.display = 'none';
          player1 = data.player1;
          player2 = data.player2;
          if (char_choice === player1) {
            player = 1;
          }
          else if (char_choice === player2) {
            player = 2;
          }
          else {
            player = 0;
          }
          createRightPaddle();
          initTextParams();
          createP1ScoreText();
          createP2ScoreText();
          createP1NameText();
          createP2NameText();
          createBall();
          renderer.render(scene, camera);
          // listen to keyboard events to move the paddles
          document.addEventListener("keydown", keyDownEventListener);
          document.addEventListener("keyup", keyUpEventListener);
        }
      }

      if (data.command === "match_info") {
        if (data.mode === "end") {
          winMessage.winner = data.winner
          removeElements();
        }
      }

      if (data.command === "tournament_info") {
        displayTournamentMatches(data);
        if (data.mode === "end") {
          winMessage.ranking[1] = data.playerRanking.firstPosition
          winMessage.ranking[2] = data.playerRanking.secondPosition
          winMessage.ranking[3] = data.playerRanking.thirdPosition
          winMessage.ranking[4] = data.playerRanking.fourthPosition
          removeElements();
        }
      }

      if (data.command === "match_data") {
        ballMesh.position.x = data.ball.x * tableWidth;
        ballMesh.position.y = data.ball.y * tableHeight;
        ballMesh.position.z = scaleFloatToRange(data.ball.z, minBallZ, maxBallZ);
        leftPaddleMesh.position.y = data.paddleLeft * tableHeight;
        rightPaddleMesh.position.y = data.paddleRight * tableHeight;
        updatePaddleCam(); // only when y changes?
        if (data.score.player1 != player1Score) {
          player1Score = data.score.player1;
          removeAndDisposeAndMakeUndefined(player1ScoreMesh);
          createP1ScoreText();
          // setPaddleCamForLeadingPlayer();
        }
        else if (data.score.player2 != player2Score) {
          player2Score = data.score.player2;
          removeAndDisposeAndMakeUndefined(player2ScoreMesh);
          createP2ScoreText();
          // setPaddleCamForLeadingPlayer();
        }
        
        renderer.render(scene, camera);
      }
    } catch (error) {
      console.error("Error parsing received data:", error);
      console.log("Received data:", event.data);
    }
  };


  function displayResultMessage() {
    if (winMessage.game_mode === "match") {
      if (winMessage.player === winMessage.winner) {
        document.getElementById('img_win').style.display = "block";
        document.getElementById('closing_message').innerHTML = "🌴🎉 Congratulations, you won! 🎉🌴";
      }
      else {
        document.getElementById('img_loss').style.display = "block";
        document.getElementById('closing_message').innerHTML = "👽 Unfortunately, you lost! 👽";
      }
    }
    else if (winMessage.game_mode === "tournament") {
      if (winMessage.player === winMessage.ranking[1]) {
        document.getElementById('img_win').style.display = "block";
        document.getElementById('closing_message').innerHTML = "🌴🎉 Congratulations, you won! 🎉🌴";
      }
      else {
        document.getElementById('img_loss').style.display = "block";
        document.getElementById('closing_message').innerHTML = "👽 Unfortunately, you lost! 👽";
      }
      document.getElementById('tournament_info').style.display = 'none';
      document.getElementById('closing_message_ranking').style.display = "block";
      document.getElementById('closing_message_ranking').innerHTML = "Ranking: <br> 1. " + winMessage.ranking[1] + "<br> 2. " + winMessage.ranking[2] + "<br> 3. " + winMessage.ranking[3] + "<br> 4. " + winMessage.ranking[4];
      document.getElementById('closing_message').innerHTML = winMessage.ranking[1] + " won the tournament!";
    }
  }

  // Event handler for connection closure
  function handleWebSocketClose(event) {
    console.log("WebSocket connection closed! (code: " + event.code + ")");

    /*********************************************************/
    /***************** CHANGES STARTING HERE *****************/
    /*********************************************************/

    setTimeout(function () {
      document.getElementById('game_board').style.display = 'none';
      document.getElementById('end_closing_message').style.display = 'inline-block';
      document.getElementById('closing_message').style.display = 'inline-block';

      document.getElementById('game_info').style.display = 'none';
      document.getElementById('game_message').style.display = 'none';
      //document.getElementById('tournament_info').style.display = 'none';

      if (event.code === 3001 || event.code === 3002) {
        //document.getElementById('closing_message').innerHTML = "GAME OVER";
        displayResultMessage();
      }
      else if (event.code === 4001) {
        document.getElementById('closing_message').innerHTML = "A duplicate has been detected.";
      }
      else if (event.code === 4002) {
        document.getElementById('closing_message').innerHTML = "The room is full.";
      }
      else if (event.code === 4005 || event.code === 4006) {
        removeElements();
        document.getElementById('closing_message').innerHTML = "The connection has been lost.";
      }
    }, 1000);

    /*********************************************************/
    /****************** CHANGES ENDING HERE ******************/
    /*********************************************************/

  };

  // Error handler for WebSocket errors
  function handleWebSocketError(error) {
    console.error("WebSocket encountered an error: ", error);
    // Handle WebSocket errors
  };


  document.getElementById("end_closing_message").addEventListener("click", function () {
    document.getElementById('restartPongSection').style.display = 'block';
    document.getElementById('closing_message').style.display = 'none';
    document.getElementById('end_closing_message').style.display = 'none';
    document.getElementById('img_win').style.display = 'none';
    document.getElementById('img_loss').style.display = 'none';
    document.getElementById('closing_message_ranking').style.display = 'none';
  });

  document.getElementById("refreshLink").addEventListener("click", function () {
    event.preventDefault(); // Prevent the default behavior of the link
    location.reload(); // Reload the page
  });

});