const MAX_WIDTH = 16;
const MAX_HEIGHT = 16;

const WIDTH_SLIDER = document.getElementById('width');
const HEIGHT_SLIDER = document.getElementById('height');
const WIDTH_OUTPUT = document.getElementById('width_output');
const HEIGHT_OUTPUT = document.getElementById('height_output');
const TEXTAREA_OUTPUT = document.getElementById('output');

const EMPTY = 0;

let boardWidth, boardHeight;
let board = [];
let start = undefined;
let tool = 1;

function setup() {
  const cnv = createCanvas(100, 100)
  cnv.parent('canvas_container');

  for (let y = 0; y < MAX_HEIGHT; y++) {
    board.push([]);
    for (let x = 0; x < MAX_WIDTH; x++) {
      board[y].push(0);
    }
  }
}

function draw() {
  background(255);
  boardWidth = parseInt(WIDTH_SLIDER.value);
  boardHeight = parseInt(HEIGHT_SLIDER.value);
  HEIGHT_OUTPUT.value = boardHeight.toString().padStart(2, '0');
  WIDTH_OUTPUT.value = boardWidth.toString().padStart(2, '0');

  resizeCanvas(boardWidth*CELL_SIZE, boardHeight*CELL_SIZE);

  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const screenX = screenSpace(x);
      const screenY = screenSpace(y);
    
      fill(getColorOfCell(x, y, board));
      circle(screenX, screenY, CELL_SIZE);
      fill(0)
      textAlign('center');
      text(`${x}, ${y}`, screenX, screenY);
    }
  }
  drawTool();
}

function calculateOutput() {
  let outputBoard = [];
  for (let y = 0; y < boardHeight; y++) {
    outputBoard.push([]);
    for (let x = 0; x < boardWidth; x++) {
      outputBoard[y].push(board[y][x]);
    }
  }

  if (start === undefined) {
    alert('Warning: a start cell is not set. Defaulting to (0,0)');
    start = {x: 0, y: 0};
    outputBoard[0][0] = 8;
  }

  let output = {
    board: outputBoard,
    start: start,
    width: boardWidth,
    height: boardHeight
  }
  TEXTAREA_OUTPUT.value = JSON.stringify(output);
}

function drawTool() {
  push();
  strokeWeight(5);
  const CIRCLE_SIZE = 30;

  switch (tool) {
    case 0:
      fill(EMPTY_COLOR);
      circle(mouseX, mouseY, CIRCLE_SIZE);
      break;
    case 1:
      fill(WALL_COLOR);
      circle(mouseX, mouseY, CIRCLE_SIZE);
      break;
    case 8:
      fill(START_COLOR);
      circle(mouseX, mouseY, CIRCLE_SIZE);
      break;
  }
  pop();
}

function mousePressed() {
  const cellX = inverseScreenSpace(mouseX);
  const cellY = inverseScreenSpace(mouseY);
  if (cellX > -1 && cellX < boardWidth && cellY > -1 && cellY < boardHeight) { // check for valid cell coordinates
    // when start tool is used
    if (tool === 8) {
      // don't try removing the start cell if it doesn't exist
      if (start !== undefined) board[start.y][start.x] = 0;
      start = {x: cellX, y: cellY};
    }
    // when NOT using start tool, reset start var if reseting the current start cell
    else if (start !== undefined && areVectorsEqual(start, {x: cellX, y: cellY})) {
      start = undefined;
    }
    board[cellY][cellX] = tool;
  }
}

function keyPressed() {
  switch (keyCode) {
    case 49: // 1 key for empty/ delete
      tool = 0;
      break;
    case 50: // 2 key for wall
      tool = 1;
      break;
    case 51: // 3 key for start
      tool = 8;
      break;
  }
}