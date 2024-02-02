
import * as THREE from 'three';
import {FontLoader} from 'three/FontLoader';
import {TextGeometry} from 'three/TextGeometry';
import {OrbitControls} from 'three/OrbitControls';

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
  const winningScore = 2;
  const ball = {};
  const intervalUpdateRateMs = 20;
  var tableMesh, tableUpperWallMesh, tableLowerWallMesh, netMesh, tableWidth, tableHeight, tableDepth;
  var ballMesh, minBallZ, maxBallZ;
  const ballSize = 0.4, initBallSpeed = 0.2, minBallSpeed = 0.1, amountToSlow = 0, maxBallSpeedDivider = 4; // amountToSlow = 0.025
  var leftPaddleMesh, rightPaddleMesh, paddleWidth, paddleHeight, paddleDepth, leftPaddleSpeed = 0, rightPaddleSpeed = 0, paddleCam = false;
  var paddleIncreaseKeyLeft, paddleDecreaseKeyLeft, paddleIncreaseKeyRight, paddleDecreaseKeyRight, paddleIntervalLeft, paddleIntervalRight;
  var textHeight, textDepth, textYpos, leftScoreXpos, rightScoreXpos, leftNameOffset, rightNameOffset;
  var scorePlayer1Mesh, scorePlayer2Mesh;
  var namePlayer1Mesh, namePlayer2Mesh;
  var controls;
  var player1, player2;
  //var player = 0;
  var winnerName;
  var winnerColour;
  //var char_choice;
  var gameSocket;
  var animationId;

  // variables for tournament:
  var game_mode; // "local" or "remote" or "tournament"


  /**************************************************/
  /******************** NEW PART ********************/
  /**************************************************/

  // Function to show the name input field
  function showNameInput() {
    document.getElementById('pongChooseMode').style.display = 'none';
    document.getElementById('nameInputSectionLocal').style.display = 'block';
  }

  // Function to show the canvas after submitting the name
  function submitNameAndStartGame() {
    const playerName1 = document.getElementById('playerName1').value.trim();  // Get the player name and remove leading and trailing whitespace
    const playerName2 = document.getElementById('playerName2').value.trim();  // Get the player name and remove leading and trailing whitespace
    if ((playerName1 !== '' && playerName1.length <= 10) 
        && (playerName2 !== '' && playerName2.length <= 10)) { // Check if names are not empty and have max 10 characters
        
        document.getElementById('nameInputSectionLocal').style.display = 'none';
        document.getElementById('game_board').style.display = 'block';

        // Connect to the websocket
        var roomCode = "local";
        var connectionString =
          "ws://" + window.location.host + "/ws/play/" + roomCode + "/" + playerName1 + "/" + playerName2 + "/";
        gameSocket = new WebSocket(connectionString);
        console.log("[WebSocket started] connectionString: ", connectionString);

        // set game variables
        player1 = playerName1;
        player2 = playerName2;
        game_mode = roomCode;

        // start the game
        initGame();

        /* gameSocket.onopen = function (event) {
            console.log("[WebSocket opened] connectionString: ", connectionString);
        
            // Now that the connection is open, you can send data
            var matchInfo = {
                command: "match_info",
                mode: "end",
                score: {
                    player1: 11,
                    player2: 4,
                },
                winner: playerName1,
            };
            gameSocket.send(JSON.stringify(matchInfo));
        }; */

        // Set the event handlers
        //gameSocket.onmessage = handleWebSocketOpen;
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

  // Event listener for the Start Game Button
  document.getElementById('startLocalGameButton').addEventListener('click', showNameInput);

  // Event listener for the Submit Name Button
  document.getElementById('submitNameButtonLocal').addEventListener('click', submitNameAndStartGame);

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
    initStart();
    renderer.render(scene, camera);
    startAnimationLoop();
  }

  function initStart() {
    createLeftPaddle();
    createRightPaddle();
    initTextParams();
    createP1ScoreText();
    createP2ScoreText();
    createP1NameText();
    createP2NameText();
    renderer.render(scene, camera);
    sceneProperties.currentScene = "game";
    initBall();
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
      //leftPaddleSpeed, rightPaddleSpeed
      if (paddleSpeed > 0) // if the paddle is moving, it adds to the ball speed, if it is not moving the ball will slow a little
        newBallSpeed = newBallSpeed + paddleSpeed / maxBallSpeedDivider; // divider controls overall max ball speed
      if (newBallSpeed < minBallSpeed) // we check that the final ball speed doesn't fall below a minimum threshold
        newBallSpeed = minBallSpeed;
      ball.speed = newBallSpeed;
  }

  function reinitialise() {
    animationId = undefined;
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    leftPaddleSpeed = 0;
    rightPaddleSpeed = 0;
    paddleCam = false;
    player1 = undefined;
    player2 = undefined;
    winnerName = undefined;
    winnerColour = undefined;
    sceneProperties.currentScene = "waitingForPlayers";
  }

  function checkForWin(score, thisPlayer, playerColour) {
    if (score === winningScore) {
      sceneProperties.currentScene = "none";
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
      
      console.log("sending match info");
      sendMatchInfo(); // send "end" command to add gameData to database
      console.log("reinitialising");
      reinitialise();
      
      // initClosingTitles(sceneProperties);
    }
  }

  function setNormalCam() {
    controls.enabled = true;
    paddleIncreaseKeyLeft = "W";
    paddleDecreaseKeyLeft = "S";
    paddleIncreaseKeyRight = "ArrowUp";
    paddleDecreaseKeyRight = "ArrowDown";
    sceneProperties.camera.position.set(0, 0, 11);
    sceneProperties.camera.rotation.set(0, 0, 0);   
  }

  function initBall() {
    var geometry = new THREE.SphereGeometry(ballSize, 50);
    var material = new THREE.MeshPhongMaterial({color: sceneProperties.ballColour});
    ballMesh = new THREE.Mesh(geometry, material);
    const halfBallSize = ballSize / 2;
    ballMesh.position.set(0, 0, halfBallSize + minBallZ);
    // ball.height = generateRandomBallHeight();
    ball.dx = Math.random() < 0.5 ? 1 : -1;
    ball.dy = (Math.random() * 2) - 1;
    ball.height = minBallZ;
    ball.speed = initBallSpeed;
    sceneProperties.scene.add(ballMesh);
  }

  function ballPassedLeftPaddle() {
    scorePlayer2++;
    removeAndDisposeAndMakeUndefined(scorePlayer2Mesh);
    createP2ScoreText();
    removeAndDisposeAndMakeUndefined(ballMesh);
    renderer.render(scene, camera);
    initBall();
    checkForWin(scorePlayer2, player2, sceneProperties.p2Colour);
  }

  function ballPassedRightPaddle() {
    scorePlayer1++;
    removeAndDisposeAndMakeUndefined(scorePlayer1Mesh);
    createP1ScoreText();
    removeAndDisposeAndMakeUndefined(ballMesh);
    renderer.render(scene, camera);
    initBall();
    checkForWin(scorePlayer1, player1, sceneProperties.p1Colour);
  }

  function updateBall() {
    ballMesh.position.x = ballMesh.position.x + ball.dx * ball.speed;
    ballMesh.position.y = ballMesh.position.y + ball.dy * ball.speed;
    // calculate z based on ball.height
    const standardDeviation = tableWidth / 4;
    const mean = 0;
    const exponent = -((ballMesh.position.x - mean) ** 2) / (2 * standardDeviation ** 2);
    const halfBallSize = ballSize / 2;
    ballMesh.position.z = halfBallSize + ball.height * Math.exp(exponent);
  }

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

  function paddleUpdateLeft(incDec) {
    let newPaddleY, limit;
    
    leftPaddleSpeed = leftPaddleSpeed + 0.05;
    if (incDec === "increase") {
      newPaddleY = leftPaddleMesh.position.y + leftPaddleSpeed;
      limit = tableHeight / 2 - paddleHeight / 2;
      if (newPaddleY > limit) {
        newPaddleY = limit;
        clearInterval(paddleIntervalLeft);
        leftPaddleSpeed = 0;
      }
    }
    else if (incDec === "decrease") {
      newPaddleY = leftPaddleMesh.position.y - leftPaddleSpeed;
      limit = -tableHeight / 2 + paddleHeight / 2;
      if (newPaddleY < limit) {
        newPaddleY = limit;
        clearInterval(paddleIntervalLeft);
        leftPaddleSpeed = 0;
      }
    }
    leftPaddleMesh.position.y = newPaddleY;
  }

  function paddleUpdateRight(incDec) {
    let newPaddleY, limit;
    
    rightPaddleSpeed = rightPaddleSpeed + 0.05;
    if (incDec === "increase") {
      newPaddleY = rightPaddleMesh.position.y + rightPaddleSpeed;
      limit = tableHeight / 2 - paddleHeight / 2;
      if (newPaddleY > limit) {
        newPaddleY = limit;
        clearInterval(paddleIntervalRight);
        rightPaddleSpeed = 0;
      }
    }
    else if (incDec === "decrease") {
      newPaddleY = rightPaddleMesh.position.y - rightPaddleSpeed;
      limit = -tableHeight / 2 + paddleHeight / 2;
      if (newPaddleY < limit) {
        newPaddleY = limit;
        clearInterval(paddleIntervalRight);
        rightPaddleSpeed = 0;
      }
    }
    rightPaddleMesh.position.y = newPaddleY;
  }


  /******************************************************/
  /******************* KEYBOARD EVENTS ******************/
  /******************************************************/

  // listen to keyboard events to move the paddles
  document.addEventListener("keydown", function (e) {
    if (gameSocket !== undefined && gameSocket.readyState === WebSocket.OPEN && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKeyLeft.toLowerCase()) {
      console.log("paddleIncreaseKeyLeft pressed");
      clearInterval(paddleIntervalLeft);
      leftPaddleSpeed = 0;
      paddleIntervalLeft = setInterval(() => {
        paddleUpdateLeft("increase");
      }, intervalUpdateRateMs);
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKeyLeft.toLowerCase()) {
      clearInterval(paddleIntervalLeft);
      leftPaddleSpeed = 0;
      paddleIntervalLeft = setInterval(() => {
        paddleUpdateLeft("decrease");
      }, intervalUpdateRateMs);
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKeyRight.toLowerCase()) {
      clearInterval(paddleIntervalRight);
      rightPaddleSpeed = 0;
      paddleIntervalRight = setInterval(() => {
        paddleUpdateRight("increase");
      }, intervalUpdateRateMs);
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKeyRight.toLowerCase()) {
      clearInterval(paddleIntervalRight);
      rightPaddleSpeed = 0;
      paddleIntervalRight = setInterval(() => {
        paddleUpdateRight("decrease");
      }, intervalUpdateRateMs);
    }
  });

  // listen to keyboard events to stop the paddle if key is released
  document.addEventListener("keyup", function (e) {
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKeyLeft.toLowerCase()) {
      clearInterval(paddleIntervalLeft);
      leftPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleIncreaseKeyRight.toLowerCase()) {
      clearInterval(paddleIntervalRight);
      rightPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKeyLeft.toLowerCase()) {
      clearInterval(paddleIntervalLeft);
      leftPaddleSpeed = 0;
    }
    if (sceneProperties.currentScene === "game" && e.key.toLowerCase() === paddleDecreaseKeyRight.toLowerCase()) {
      clearInterval(paddleIntervalRight);
      rightPaddleSpeed = 0;
    }    
  });


  /******************************************************/
  /**************** SENDING ON WEBSOCKET ****************/
  /******************************************************/

  // SENDING DATA TO WEBSOCKET
  function sendMatchInfo() {
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


  /******************************************************/
  /************ CLOSING & ERROR OF WEBSOCKET ************/
  /******************************************************/

  // Event handler for connection closure
  function handleWebSocketClose(event) {
    console.log("WebSocket connection closed! (code: " + event.code + ")");

    setTimeout(function () {
      document.getElementById('game_board').style.display = 'none';
      document.getElementById('end_closing_message').style.display = 'inline-block';
      document.getElementById('closing_message').style.display = 'block';

      if (event.code === 3001 || event.code === 3002) {
        document.getElementById('closing_message').innerHTML = "GAME OVER";
      }
      else if (event.code === 4001) {
        document.getElementById('closing_message').innerHTML = "A duplicate has been detected.";
      }
      else if (event.code === 4002) {
        document.getElementById('closing_message').innerHTML = "The room is full.";
      }
      else if (event.code === 4005 || event.code === 4006) {
        document.getElementById('closing_message').innerHTML = "The connection has been lost.";
      }
    }, 1000);
  };

  // Error handler for WebSocket errors
  function handleWebSocketError(error) {
    console.error("WebSocket encountered an error: ", error);
    // Handle WebSocket errors
  };

});