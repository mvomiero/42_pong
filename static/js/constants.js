const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;

const paddleSpeed = 6;
const ballSpeed = 2;

export { canvas, context, grid, paddleHeight, maxPaddleY, paddleSpeed, ballSpeed };