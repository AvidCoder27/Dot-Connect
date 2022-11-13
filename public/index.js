const TEXT_OUTPUT_P = document.getElementById("text_output_p");
const TEXT_OUTPUT = document.getElementById("text_output");
const EXECUTE_BUTTON = document.getElementById("execute");
const STOP_BUTTON = document.getElementById("stop_execute");
const SPEED_SLIDER = document.getElementById("move_speed");
const LEVEL_SELECTOR = document.getElementById("level");

let BOARDS;
let originalBoard;
let board;
let boardWidth, boardHeight;
let start;
let currentPosition;

let boardOfNodes = [];
let solution;
let moveQueue = [];
let doMoves = false;
let timeSinceLastMove = 0; // in milliseconds
let moveTime = 170; // in milliseconds

let selectedLevel;

function preload(){
  const jsonURL = "./levels.json"
  BOARDS = loadJSON(jsonURL);
}

function setup() {
	const cnv = createCanvas(100,100);
  cnv.parent('game');
  newgameButton();
}

function draw() {
  timeSinceLastMove += deltaTime;
  moveTime = 800 - SPEED_SLIDER.value;
  background(255);

  if (timeSinceLastMove > moveTime && doMoves){
    timeSinceLastMove = 0;
    const currentMove = moveQueue.shift();
    if (currentMove === undefined) {
      doMoves = false;
    } else {
      movePlayer(currentMove);
    }
  }

	for (let x = 0; x < boardWidth; x++){
		for (let y = 0; y < boardHeight; y++){
      const screenX = screenSpace(x);
      const screenY = screenSpace(y);
    
      fill(getColorOfCell(x, y, originalBoard));
      circle(screenX, screenY, CELL_SIZE);
		}
	}

  for (let x = 0; x < boardWidth; x++){
		for (let y = 0; y < boardHeight; y++){
      const screenX = screenSpace(x);
      const screenY = screenSpace(y);
      
      if (board[y][x] && board[y][x] !== "WL") {
        push();
        fill(PLAYER_COLOR);
        stroke(PLAYER_COLOR);
        circle(screenX, screenY, CELL_SIZE/2);
        strokeWeight(10);
        line(screenX, screenY, screenX - board[y][x].x * CELL_SIZE, screenY - board[y][x].y * CELL_SIZE);
        pop();
      }
		}
	}

  // put node indices on the board
  push();
  fill(0);
  textAlign("center");
  for (let y = 0; y < boardHeight; y++) for (let x = 0; x < boardWidth; x++) if (boardOfNodes[y][x] !== -1) 
    text(boardOfNodes[y][x], screenSpace(x), screenSpace(y));
  pop();
}

function movePlayer(direction){ // {x: horizontal, y: vertical}
  const proposedPosition = addVector(currentPosition, direction);

  if(areVectorsEqual(proposedPosition, subtractVector(currentPosition, getCellValue(currentPosition)))) undoMove();

  // check if the proposedPosition is invalid
  if ( !(
    proposedPosition.x > boardWidth || proposedPosition.y > boardHeight-1 || proposedPosition.x < 0 || proposedPosition.y < 0 ||
    getCellValue(proposedPosition) !== null || originalBoard[proposedPosition.y][proposedPosition.x] === 1
  )) {
    currentPosition = {...proposedPosition};
    // puts the direction into the board to represent that the player moved into that cell
    setCellValue(currentPosition, direction);
    
    checkForFullBoard() ? alert("You won!") : null;
  }
}

function undoMove(){
  const lastMove = getCellValue(currentPosition);
  // make sure the current cell is not a start cell
  if (typeof(lastMove) !== "string") {
    setCellValue(currentPosition, null);
    currentPosition = subtractVector(currentPosition, lastMove);
  }
}

function executeSolution() {
  resetBoards();

  // create an array filled all the nodes in boardOfNodes, but inside only 1 array
  const unnestedNodes = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      unnestedNodes.push(boardOfNodes[y][x]);
    }
  }

  // create an array filled with the solution as items, each one with an x and y, in the order that they should be executed 
  const solutionAsCoords = [];
  for (let i = 0; i < solution.length; i++) {
    const unnestedSolution = unnestedNodes.indexOf(solution[i]);
    solutionAsCoords.push({
      x: unnestedSolution%boardWidth,
      y: Math.floor(unnestedSolution/boardWidth)
    })
  }

  // fill up move queue with the difference between each step in solutionAsCoords, essentially the input instructions
  moveQueue = [];
  for (let i = 1; i < solutionAsCoords.length; i++) { // start at 1 because the first item in solutions is the starting position
    moveQueue.push(subtractVector(solutionAsCoords[i], solutionAsCoords[i-1]));
  }
  doMoves = true;
  STOP_BUTTON.disabled = false;
  timeSinceLastMove = 0;
}

function stopExecution() {
  STOP_BUTTON.disabled = true;
  doMoves = false;
  moveQueue = [];
}

async function sendData() {
  const data = {message: "SOLVE BOARD " + selectedLevel, board: originalBoard, width: boardWidth, height: boardHeight}; 
  const options = {
      method: "POST",
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  };

  console.log(getTimeFormattedHMS() + ": Request POSTed to server");
  const response = await fetch('/api', options);
  const responseData = await response.json();

  console.log(getTimeFormattedHMS() + ": Response received with status " + responseData.status);
  console.log(responseData);
  if (responseData.status === "success") {
    solution = responseData.solution;
    setServerDomState(true);
  } else {
    alert("There's no solution for this board!");
  }
}

function newgameButton() {
  selectedLevel = LEVEL_SELECTOR.value;
  setServerDomState(false);
  restartButton();
}

function restartButton(){
  stopExecution();
  resetBoards();
}

function resetBoards() {
  p = BOARDS[selectedLevel];
  originalBoard = p.board

  boardWidth = p.width;
  boardHeight = p.height;

  start = p.start;
  currentPosition = {...start};

  // create an empty board, except for a player spot at the start position
  board = [];
  for (let y = 0; y < boardHeight; y++) {
    board[y] = []
    for (let x = 0; x < boardWidth; x++) {
      if (originalBoard[y][x] === 1)  board[y][x] = "WL";
      else board[y][x] = null;
    }
  }
  setCellValue(start, "ST");

  let boardIndex = 0;
  boardOfNodes = [];
    for (let y = 0; y < boardHeight; y++){
      boardOfNodes.push([]);
      for (let x = 0; x < boardWidth; x++){
        boardOfNodes[y].push([]);
        if (originalBoard[y][x] !== 1) {
          boardOfNodes[y][x] = boardIndex;
          boardIndex++;
        } else boardOfNodes[y][x] = -1;
      }
    }

  resizeCanvas(boardWidth*CELL_SIZE, boardHeight*CELL_SIZE);
}

function checkForFullBoard(){
    for (let y = 0; y < boardHeight; y++) for (let x = 0; x < boardWidth; x++) if (!board[y][x]) return false;
    return true;
}

function keyPressed(){
  if (!doMoves) {
    switch(keyCode) {
      case LEFT_ARROW:
        movePlayer({x: -1, y: 0});
        break;
      case RIGHT_ARROW:
        movePlayer({x: 1, y: 0});
        break;
      case UP_ARROW:
        movePlayer({x: 0, y: -1});
        break;
      case DOWN_ARROW:
        movePlayer({x: 0, y: 1});
        break;
      case 90: // Z key
        undoMove();
        break;
      case 82: // R key - probably shouldn't be disabled when doMoves is true, but whatever
        restartButton();
    }
  }
}

function setServerDomState(enabled) {
  if (enabled) {
    TEXT_OUTPUT_P.innerHTML = "Below is the solution:";
    TEXT_OUTPUT.value = solution.toString().replaceAll(",", " > ");
  } else {
    TEXT_OUTPUT_P.innerHTML = "Press the solve button above to get the solution.";
    TEXT_OUTPUT.value = "";
    STOP_BUTTON.disabled = true;
  }
  TEXT_OUTPUT.disabled = !enabled;
  EXECUTE_BUTTON.disabled = !enabled;
}