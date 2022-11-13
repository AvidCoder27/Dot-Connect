const TEXT_OUTPUT_P = document.getElementById("text_output_p");
const TEXT_OUTPUT = document.getElementById("text_output");
const EXECUTE_BUTTON = document.getElementById("execute");
const STOP_BUTTON = document.getElementById("stop_execute");
const SPEED_SLIDER = document.getElementById("move_speed");
const LEVEL_SELECTOR = document.getElementById("level");
const CUSTOM_LEVEL_TEXTAREA = document.getElementById("text_custom");

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
  } else if (responseData.status === "fail") {
    alert("There's no solution for this board!");
  } else if (responseData.status === "missing start") {
    alert("The board sent contained no starting cell!");
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
  if (selectedLevel === 'CUSTOM') {
    try {
      let parsedCustomLevel = JSON.parse(CUSTOM_LEVEL_TEXTAREA.value);
      const parsedBoard = parsedCustomLevel.board;

      if (parsedBoard.length !== parsedCustomLevel.height){
        throw new LevelValidationError("Number of rows does not match height, or board is not an array.");
      }

      // loop through all the rows
      for (let y = 0; y < parsedBoard.length; y++) {
        
        if (parsedBoard[y].length !== parsedCustomLevel.width) {
          throw new LevelValidationError(`Number of columns in row ${y} does not match width, or row ${y} is not an array.`);
        }
        // loop through all the items in this row and check for invalids
        for (let x = 0; x < parsedBoard[y].length; x++) {
          if (typeof parsedBoard[y][x] !== "number" || (parsedBoard[y][x] !== 0 && parsedBoard[y][x] !== 1 && parsedBoard[y][x] !== 8)) {
            console.log(parsedBoard[y][x]);
            throw new LevelValidationError(`Cell (${x}, ${y}) contains contains an invalid element.`);
          }
        }
      }
      if (parsedCustomLevel.start === undefined) {
        throw new LevelValidationError("No start cell is provided.");
      } else {
        // this part only runs if start is defined so as not to throw an unwanted error
        if (parsedCustomLevel.start.x === undefined || typeof parsedCustomLevel.start.x !== "number")
          throw new LevelValidationError("Start cell is missing X coordinate.");
        if (parsedCustomLevel.start.y === undefined || typeof parsedCustomLevel.start.y !== "number")
          throw new LevelValidationError("Start cell is missing Y coordinate.");
      }
      if (
        parsedCustomLevel.start.x < 0 ||
        parsedCustomLevel.start.y < 0 ||
        parsedCustomLevel.start.x >= parsedCustomLevel.width ||
        parsedCustomLevel.start.y >= parsedCustomLevel.height
      ){
        throw new LevelValidationError("Start cell is out of bounds.");
      }

      let isEigthPresent = false;
      for (let y = 0; y < parsedBoard.height; y++) {
        for (let x = 0; x < parsedBoard.width; x++) {
          if (parsedBoard[y][x] === 8){
            isEigthPresent = true;
            break;
          }
        }
        if (isEigthPresent) break;
      }
      if (!isEigthPresent) {
        // if it's missing an 8, just put one in at the start position
        parsedCustomLevel.board[parsedCustomLevel.start.y][parsedCustomLevel.start.x] = 8;
      }
    
      // if there are no errors, then it's safe to set p
      p = parsedCustomLevel;

    } catch(err) {
      console.log(err.name + ": " + err.message);
      alert("The custom level entered is invalid!\n " + err.message);
      return;
    }
  } else {
    p = BOARDS[selectedLevel];
  }
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