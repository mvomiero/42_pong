// documentation here: https://www.notion.so/42wolfsburgberlin/Interface-Frontend-Backend-To-Do-List-eff7e8c582ff4a32b088f6aecf87b626

// TODO: fix paddlecam issues - highlights wrong player and doesn't reset correctly when scores are equal
// TODO: test reinstating opening and closing titles
// TODO: bring back random ball height
// TODO: still some minor ball ghosting - but why does it happen
// TODO: why does moving bat cause ball to move faster? probably because we're asking for the next animation frame twice somehow
// TODO: ball gets trapped in top/bottom walls when bat is near top/bottom
// TODO: make ball square and calculate bat hit and line cross from outside of ball, not centre (low priority)
// TODO: tron-styling: wireframe, colours etc

// TODO: waiting for players text...
// TODO: fix minor bat jitter
// TODO: bug, on end is winningScore + 1 still displayed?
// TODO: better font...trickier than expected...see font-notes.md
// TODO: fill database on game end
// TODO: add text "waiting for opponent to connect...to start screen"
// TODO: handle duplicate names
// TODO: only names of max 8 chars should be enterable
// TODO: rename 'player1' to 'player1name' (also needed on backend part)
// TODO: three.js elements don't resize when browser window is resized
// TODO: in final dockerised version, install three.js locally
// TODO: split back into main.js, keyboardEvents.js, websocket.js
// TODO: consider making one data structure again

// NOTE: top surface of the table is 0 on the z axis
// paddles and net are offset positively on z axis by half their depth
// table is offset negatively by half its depth
// ball is offset positively by half its size

import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';
import {OrbitControls} from 'three/OrbitControls';
// import {initOpeningTitles} from './openingTitles.js';
// import {animateOpeningTitles} from './openingTitles.js';
// import {initClosingTitles} from './closingTitles.js';
// import {animateClosingTitles} from './closingTitles.js';

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
    currentScene: "waitingForPlayers", // scenes: "openingTitles", "preGame", "game", "closingTitles" and "end"
    backgroundColour: 0x87CEEB,
    p1Colour: 0x990000,
    otherTextColour: 0xFFFFAA,
    p2Colour: 0x009900,
    ballColour: 0xFF0000,
    tableColour: 0x46A07E,
    tableWallsColour: 0x77777E,
    font: font,
  };
  sceneProperties.scene.background = new THREE.Color(sceneProperties.backgroundColour);
  light.position.set(0, 0, 12);
  sceneProperties.scene.add(light);

  var scorePlayer1 = 0, scorePlayer2 = 0;
  const winningScore = 4;
  const ball = {};
  const intervalUpdateRateMs = 20;
  var tableMesh, tableUpperWallMesh, tableLowerWallMesh, netMesh, tableWidth, tableHeight, tableDepth;
  var ballMesh, minBallZ, maxBallZ;
  const ballSize = 0.4, initBallSpeed = 0.2, minBallSpeed = 0.1, amountToSlow = 0, maxBallSpeedDivider = 4; // amountToSlow = 0.025
  var leftPaddleMesh, rightPaddleMesh, paddleWidth, paddleHeight, paddleDepth, myPaddleSpeed, leftPaddleSpeed = 0, rightPaddleSpeed = 0, paddleCam = false;
  var paddleIncreaseKey, paddleDecreaseKey, paddleInterval;
  var textHeight, textDepth, textYpos, leftScoreXpos, rightScoreXpos, leftNameOffset, rightNameOffset;
  var scorePlayer1Mesh, scorePlayer2Mesh;
  var namePlayer1Mesh, namePlayer2Mesh;
  var controls;
  var player1, player2;
  var player = 0;
  var winnerName;
  var winnerColour;
  var char_choice;
  var gameSocket;
  var animationId;

  // variables for tournament:
  var tournament_stage; // show the state of the tournament: "waitingForPlayers", "semifinal", "final", "closing"
                        // "final" & "semifinal": when activily playing the match
                        // state: my semifinal is over and the other semifinal is still running -> still in "semifinal" (trigger is match_info with mode "start")
                        // "closing": when the tournament is over, WebSocket is closed and e.g. the closing titles are shown
  var game_mode; // "local" or "remote" or "tournament"


  /**************************************************/
  /******************** NEW PART ********************/
  /**************************************************/

  // Function to show the name input field
  function showNameInput() {
    document.getElementById('startRemoteGameButton').style.display = 'none';
    document.getElementById('nameInputSection').style.display = 'block';
  }

  // Function to show the canvas after submitting the name
  function submitNameAndStartGame() {
    const playerName = document.getElementById('playerName').value.trim();  // Get the player name and remove leading and trailing whitespace
    if (playerName !== '' && playerName.length <= 10) { // Check if name is not empty and has max 10 characters
        document.getElementById('nameInputSection').style.display = 'none';
        document.getElementById('game_board').style.display = 'block';

        // Connect to the websocket
        // roomCode, connectionString and gameSocket are set as var as we will need to change them later!
        var roomCode = document.getElementById("room_code").value;
        if (roomCode === "Tournament") {
            game_mode = "tournament";
            tournament_stage = "waitingForPlayers";
        } else if (roomCode === "Match") {
            game_mode = "remote";
        }
        char_choice = playerName;
        var connectionString =
          "ws://" + window.location.host + "/ws/play/" + roomCode + "/" + char_choice + "/";
        gameSocket = new WebSocket(connectionString);
        console.log("[WebSocket started] connectionString: ", connectionString);

        // start the game
        initGame();

        // Set the event handlers
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
    document.getElementById('nameInputSection').style.display = 'block';
  }

  // Event listener for the Start Game Button
  document.getElementById('startRemoteGameButton').addEventListener('click', showNameInput);

  // Event listener for the Submit Name Button
  document.getElementById('submitNameButton').addEventListener('click', submitNameAndStartGame);

  // Event listener for the Submit Name Button
  document.getElementById('restartGameButton').addEventListener('click', showNameInput2);

  // Function to check if an element is in the viewport
  function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  );
  }

  /**************************************************/
  /**************** END NEW PART ********************/
  /**************************************************/

  function initGame() {
    paddleWidth = sceneProperties.zoomedCanvasWidth * 0.02;
    paddleHeight = sceneProperties.zoomedCanvasWidth * 0.2;
    paddleDepth = sceneProperties.zoomedCanvasHeight * 0.05;
    minBallZ = sceneProperties.zoomedCanvasWidth * 0.05;
    maxBallZ = sceneProperties.zoomedCanvasWidth * 0.075;
    initCamera();
    initTable();
    createTable();
    renderer.render(scene, camera);
    startAnimationLoop();
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
  
  function removeAndDisposeAndMakeUndefined(object) {
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

  function initTable() {
    tableWidth = sceneProperties.zoomedCanvasWidth * 0.75;
    tableHeight = sceneProperties.zoomedCanvasHeight * 0.75;
    tableDepth = sceneProperties.zoomedCanvasHeight * 0.01;
  }

  function generateRandomBallHeight() {
    return Math.floor(Math.random() * (maxBallZ - minBallZ + 1)) + minBallZ;
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

  function createLeftPaddle() {
    var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    var leftPaddleMeshMaterial = new THREE.MeshPhongMaterial({ color: sceneProperties.p1Colour });
    leftPaddleMesh = new THREE.Mesh(paddleGeometry, leftPaddleMeshMaterial);
    const halfPaddleDepth = paddleDepth / 2;
    leftPaddleMesh.position.set(-tableWidth / 2 - paddleWidth / 2, 0, halfPaddleDepth);
    sceneProperties.scene.add(leftPaddleMesh);
    renderer.render(scene, camera);
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
      opacity: 0.1,
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
    const scorePlayer1Geom = new TextGeometry(scorePlayer1.toString(), { font: sceneProperties.font, size: textHeight, height: textDepth });
    const scorePlayer1Material = new THREE.MeshPhongMaterial({ color: sceneProperties.p1Colour });
    scorePlayer1Mesh = new THREE.Mesh(scorePlayer1Geom, scorePlayer1Material);
    const p1ScoreTextWidth = leftScoreXpos;
    const p1ScoreTextHeight = textYpos - textHeight;
    const p1ScoreTextDepth = maxBallZ;
    scorePlayer1Mesh.position.set(p1ScoreTextWidth, p1ScoreTextHeight, p1ScoreTextDepth);
    sceneProperties.scene.add(scorePlayer1Mesh);
  }

  function createP2ScoreText() {
    const scorePlayer2Geom = new TextGeometry(scorePlayer2.toString(), { font: sceneProperties.font, size: textHeight, height: textDepth });
    const scorePlayer2Material = new THREE.MeshPhongMaterial({ color: sceneProperties.p2Colour });
    scorePlayer2Mesh = new THREE.Mesh(scorePlayer2Geom, scorePlayer2Material);
    const p2ScoreTextWidth = rightScoreXpos;
    const p2ScoreTextHeight = textYpos - textHeight;
    const p2ScoreTextDepth = maxBallZ;
    scorePlayer2Mesh.position.set(p2ScoreTextWidth, p2ScoreTextHeight, p2ScoreTextDepth);
    sceneProperties.scene.add(scorePlayer2Mesh);
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

  function checkIfBallHitTopBottomTable() {
    if (ballMesh.position.y > tableHeight / 2 || ballMesh.position.y < -tableHeight / 2) {
      ball.dy = -ball.dy;
    }
  }

  function checkIfBallHitOrPassedPaddles()
  {
    // left paddle
    if (ballMesh.position.x < -tableWidth / 2)
    {
      const halfPaddleHeight = paddleHeight / 2;
      if (ballMesh.position.y < leftPaddleMesh.position.y + halfPaddleHeight && ballMesh.position.y > leftPaddleMesh.position.y - halfPaddleHeight)
      {
        ballMesh.position.x = -tableWidth / 2;
        ballHitPaddle(leftPaddleSpeed);
      }
      else
      {
        ballPassedLeftPaddle();
      }
    }
    // right paddle
    else if (ballMesh.position.x > tableWidth / 2)
    {
      const halfPaddleHeight = paddleHeight / 2;
      if (ballMesh.position.y < rightPaddleMesh.position.y + halfPaddleHeight && ballMesh.position.y > rightPaddleMesh.position.y - halfPaddleHeight)
      {
        ballMesh.position.x = tableWidth / 2;
        ballHitPaddle(rightPaddleSpeed);
      }
      else
      {
        ballPassedRightPaddle();
      }
    }
  }

  function ballHitPaddle(paddleSpeed) {
      // ball.height = generateRandomBallHeight();
      ball.dx = -ball.dx;
      ball.height = minBallZ;
      // adjust ball speed according to paddle speed:
      let newBallSpeed = ball.speed - amountToSlow; // ball first slows a bit on each paddle hit
      if (myPaddleSpeed > 0) // if the paddle is moving, it adds to the ball speed, if it is not moving the ball will slow a little
        newBallSpeed = newBallSpeed + paddleSpeed / maxBallSpeedDivider; // divider controls overall max ball speed
      if (newBallSpeed < minBallSpeed) // we check that the final ball speed doesn't fall below a minimum threshold
        newBallSpeed = minBallSpeed;
      ball.speed = newBallSpeed;
  }

  function reinitialise() {
    animationId = undefined;
    /* if (tournament_stage === undefined) {
        console.log("tournament_stage: ", tournament_stage);
        char_choice = undefined;
        gameSocket = undefined;
        animationId = undefined;
    } */
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    leftPaddleSpeed = 0;
    rightPaddleSpeed = 0;
    paddleCam = false;
    player1 = undefined;
    player2 = undefined;
    player = undefined;
    winnerName = undefined;
    winnerColour = undefined;
    sceneProperties.currentScene = "waitingForPlayers";
  }

  function checkForWin(score, thisPlayer, playerColour) {
    if (score === winningScore) {
      winnerName = thisPlayer;
      winnerColour = playerColour;
      removeAndDisposeAndMakeUndefined(ballMesh);
      removeAndDisposeAndMakeUndefined(scorePlayer1Mesh);
      removeAndDisposeAndMakeUndefined(scorePlayer2Mesh);
      removeAndDisposeAndMakeUndefined(namePlayer1Mesh);
      removeAndDisposeAndMakeUndefined(namePlayer2Mesh);
      removeAndDisposeAndMakeUndefined(leftPaddleMesh); 
      removeAndDisposeAndMakeUndefined(rightPaddleMesh);
      removeAndDisposeAndMakeUndefined(tableMesh);
      removeAndDisposeAndMakeUndefined(tableMesh);
      removeAndDisposeAndMakeUndefined(tableUpperWallMesh);
      removeAndDisposeAndMakeUndefined(tableLowerWallMesh);
      removeAndDisposeAndMakeUndefined(netMesh);
      removeAndDisposeAndMakeUndefined(controls);
      renderer.render(scene, camera);
      cancelAnimationFrame(animationId);
      /* if (tournament_stage === undefined) {
          cancelAnimationFrame(animationId);
      } */
      setTimeout(function() {
        console.log("sending match info");
        sendMatchInfo(); // send "end" command to add gameData to database
        console.log("reinitialising");
        reinitialise();
      }, 500);
      console.log("[checkForWin] gameSocket: ", gameSocket);
      // initClosingTitles(sceneProperties);
    }
  }

  function setNormalCam() {
    controls.enabled = true;
    paddleIncreaseKey = "W";
    paddleDecreaseKey = "S";
    sceneProperties.camera.position.set(0, 0, 11);
    sceneProperties.camera.rotation.set(0, 0, 0);   
  }

  function setPaddleCam(player) {
    const halfPaddleDepth = paddleDepth / 2;
    if (player === 1) {
      controls.enabled = false;
      paddleIncreaseKey = "D";
      paddleDecreaseKey = "A";
      sceneProperties.camera.position.set(leftPaddleMesh.position.x, leftPaddleMesh.position.y, halfPaddleDepth);
      sceneProperties.camera.rotation.set(Math.PI / 2, -Math.PI / 2, 0);    
    }
    if (player === 2) {
      controls.enabled = false;
      paddleIncreaseKey = "D";
      paddleDecreaseKey = "A";
      sceneProperties.camera.position.set(rightPaddleMesh.position.x, rightPaddleMesh.position.y, halfPaddleDepth);
      sceneProperties.camera.rotation.set(Math.PI / 2, Math.PI / 2, 0);    
    }
  }

  function setPaddleCamForLeadingPlayer() {
    if (scorePlayer1 > scorePlayer2) {
      if (player === 1)
        setPaddleCam(player);
      if (player === 2)
        setNormalCam();
    }
    else if (scorePlayer1 < scorePlayer2) {
      if (player === 1)
        setNormalCam();
      if (player === 2)
        setPaddleCam(player);
    }
    else if (scorePlayer1 == scorePlayer2) {
      setNormalCam(); // both players
    }
  }

  function ballPassedLeftPaddle() {
    scorePlayer2++;
    removeAndDisposeAndMakeUndefined(scorePlayer2Mesh);
    createP2ScoreText();
    removeAndDisposeAndMakeUndefined(ballMesh);  
    // setPaddleCamForLeadingPlayer();
    renderer.render(scene, camera);
    checkForWin(scorePlayer2, player2, sceneProperties.p2Colour);
    sceneProperties.currentScene = "none";
    if (player === 2) {
      sendInitBall();
    }
  }

  function ballPassedRightPaddle() {
    scorePlayer1++;
    removeAndDisposeAndMakeUndefined(scorePlayer1Mesh);
    createP1ScoreText();
    removeAndDisposeAndMakeUndefined(ballMesh);
    // setPaddleCamForLeadingPlayer();
    renderer.render(scene, camera);
    checkForWin(scorePlayer1, player1, sceneProperties.p1Colour);
    sceneProperties.currentScene = "none";
    if (player === 1) {
      sendInitBall();
    }
  }

  function updateBall() {
    var ballX, ballY;
    ballX = ballMesh.position.x + ball.dx * ball.speed;
    ballY = ballMesh.position.y + ball.dy * ball.speed;
    // p1 sends when ball is in left half of table, p2 when ball is in right half
    const tableMiddleX = 0;
    if (player === 1 && ballMesh.position.x < tableMiddleX) {
      // console.log("p1 sending ball data");
      sendBallData(ballX, ballY);
    }
    else if (player === 2 && ballMesh.position.x >= tableMiddleX) {
      // console.log("p1 sending ball data");
      sendBallData(ballX, ballY);
    }
  }

  function sendPaddleUpdate(incDec) {
    let paddleMesh;
    if (player === 1)
      paddleMesh = leftPaddleMesh;
    else if (player === 2)
      paddleMesh = rightPaddleMesh;
    // ensure paddle y cannot exceed table top/bottom
    let newPaddleY, limit;
    myPaddleSpeed = myPaddleSpeed + 0.05;
    if (incDec === "increase") {
      newPaddleY = paddleMesh.position.y + myPaddleSpeed;
      limit = tableHeight / 2 - paddleHeight / 2;
      if (newPaddleY > limit) {
        newPaddleY = limit;
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
      }
    }
    if (incDec === "decrease") {
      newPaddleY = paddleMesh.position.y - myPaddleSpeed;
      limit = -tableHeight / 2 + paddleHeight / 2;
      if (newPaddleY < limit) {
        newPaddleY = limit;
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
      }
    }
    
    // determine which paddle to update
    var command;
    if (player === 1)
      command = "updateLeftPaddle";
    if (player === 2)
      command = "updateRightPaddle";
    var paddleData = {
      command: command,
      y: newPaddleY,
      speed: myPaddleSpeed
    };
    gameSocket.send(JSON.stringify(paddleData));
  }

  // KEYBOARD EVENTS

  // listen to keyboard events to move the paddles
  document.addEventListener("keydown", function (e) {
    if (gameSocket !== undefined && gameSocket.readyState === WebSocket.OPEN && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKey.toLowerCase()) {
      clearInterval(paddleInterval);
      myPaddleSpeed = 0;
      paddleInterval = setInterval(() => {
        sendPaddleUpdate("increase");
      }, intervalUpdateRateMs);
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKey.toLowerCase()) {
      clearInterval(paddleInterval);
      myPaddleSpeed = 0;
      paddleInterval = setInterval(() => {
        sendPaddleUpdate("decrease");
      }, intervalUpdateRateMs);
    }
  });

  // listen to keyboard events to stop the paddle if key is released
  document.addEventListener("keyup", function (e) {
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKey.toLowerCase()) {
      if (player === 1)
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKey.toLowerCase()) {
      if (player === 2)
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKey.toLowerCase()) {
      if (player === 1)
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKey.toLowerCase()) {
      if (player === 2)
        clearInterval(paddleInterval);
        myPaddleSpeed = 0;
    }    
  });

  // WEBSOCKET CODE

  function sendInitBall() {
    var initBallData = {
      command: "initBall",
      dx: Math.random() < 0.5 ? 1 : -1,
      dy: (Math.random() * 2) - 1
    };
    // setTimeout(function() {
    gameSocket.send(JSON.stringify(initBallData));
    // }, 500); // 1000 milliseconds (1 second) delay
  }    

  function sendBallData(ballX, ballY) {
    var ballData = {
      command: "updateBall",
      x: ballX,
      y: ballY,
      dx: ball.dx,
      dy: ball.dy,
      height: ball.height,
      speed: ball.speed
    };
    gameSocket.send(JSON.stringify(ballData));
  }

  function sendMatchInfo() {
    if (player === 0) // needed?
      return;
    var matchInfo = {
      command: "match_info",
      mode: "end",
      score: {
        player1: scorePlayer1,
        player2: scorePlayer2,
      },
      winner: winnerName
    };
    gameSocket.send(JSON.stringify(matchInfo));
  }
  // RECEIVING DATA

  function startAnimationLoop() {
    animationId = requestAnimationFrame(startAnimationLoop);
    // console.log("current scene is: ", sceneProperties.currentScene);
    // if (sceneProperties.currentScene === "openingTitles") {
    //   animateOpeningTitles(sceneProperties);
    // }
    if (sceneProperties.currentScene === "game") {
      checkIfBallHitTopBottomTable();
      checkIfBallHitOrPassedPaddles();
      updateBall();
      renderer.render(scene, camera); 
    }
    // if (sceneProperties.currentScene === "closingTitles") {
    //   animateClosingTitles(sceneProperties);
    // }
  }

  function handleWebSocketOpen(event) {
    try {
      // console.log("RECEIVED DATA:", event.data);
      var data = JSON.parse(event.data);
      /* console.log("ed", event.data);
      console.log("currentScene", sceneProperties.currentScene); */

      if (sceneProperties.currentScene === "waitingForPlayers" && data.command === "set_player") {
        console.log("set player", data.player);
        createLeftPaddle();
        char_choice = data.player;
      }

      if (data.command === "match_info") {
        console.log("match_info", data);
      }
      if (sceneProperties.currentScene === "waitingForPlayers" && data.command === "match_info") {
        if (data.mode === "start") {
          if (tournament_stage === "final") {
            initGame();
            createLeftPaddle();
          }
          player1 = data.player1;
          player2 = data.player2;
          if (char_choice === player1) {
            player = 1;
            console.log("Player 1 set");
          }
          else if (char_choice === player2) {
            player = 2;
            console.log("Player 2 set");
          }
          else {
            player = 0;
            console.log("player set to 0");
          }
          console.log("starting game");
          createRightPaddle();
          initTextParams();
          createP1ScoreText();
          createP2ScoreText();
          createP1NameText();
          createP2NameText();
          renderer.render(scene, camera);
          sendInitBall();
          // initOpeningTitles(sceneProperties, player1, player2);
        }
      }

      if (data.command === "initBall") {
        if (ballMesh)
          removeAndDisposeAndMakeUndefined(ballMesh);
        sceneProperties.currentScene = "game";
        var geometry = new THREE.SphereGeometry(ballSize, 50);
        var material = new THREE.MeshPhongMaterial({color: sceneProperties.ballColour});
        ballMesh = new THREE.Mesh(geometry, material);
        const halfBallSize = ballSize / 2;
        ballMesh.position.set(0, 0, halfBallSize + minBallZ);
        // ball.height = generateRandomBallHeight();
        ball.dx = data.dx;
        ball.dy = data.dy;
        ball.height = minBallZ;
        ball.speed = initBallSpeed;
        sceneProperties.scene.add(ballMesh);
      }

      if (sceneProperties.currentScene === "game" && data.command === "updateBall") {
        ballMesh.position.x = data.x;
        ballMesh.position.y = data.y;
        ball.dx = data.dx;
        ball.dy = data.dy;
        ball.height = data.height;
        ball.speed = data.speed;
        // calculate z based on ball.height
        const standardDeviation = tableWidth / 4;
        const mean = 0;
        const exponent = -((ballMesh.position.x - mean) ** 2) / (2 * standardDeviation ** 2);
        const halfBallSize = ballSize / 2;
        ballMesh.position.z = halfBallSize + ball.height * Math.exp(exponent);
        // renderer.render(scene, camera);
      }

      if (sceneProperties.currentScene === "game" && data.command === "updateLeftPaddle") {
        leftPaddleMesh.position.y = data.y;
        leftPaddleSpeed = data.speed;
      }

      if (sceneProperties.currentScene === "game" && data.command === "updateRightPaddle") {
        rightPaddleMesh.position.y = data.y;
        rightPaddleSpeed = data.speed;
      }

      // keeping track of tournament_info states
      if (data.command === "tournament_info") {
        console.log("tournament_info: ", data);
        if (data.mode === "start") {
            tournament_stage = "semifinal";
        } else if (data.mode === "update" && data.matchFinal.player1 !== undefined && data.matchFinal.player2 !== undefined) {
            tournament_stage = "final";
        } else if (data.mode === "end") {
            tournament_stage = "closing";
        }
        console.log("tournament_stage: ", tournament_stage);
      }

    } catch (error) {
      console.error("Error parsing received data:", error);
      console.log("Received data:", event.data);
    }
  };

  // Event handler for connection closure
  function handleWebSocketClose(event) {
    console.log("WebSocket connection closed! (code: " + event.code + ")");

    // set canvas to display none and 'restartPongSection' to display block
    document.getElementById('game_board').style.display = 'none';
    document.getElementById('restartPongSection').style.display = 'block';

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
  function handleWebSocketError(error) {
    console.error("WebSocket encountered an error: ", error);
    // Handle WebSocket errors
  };

});