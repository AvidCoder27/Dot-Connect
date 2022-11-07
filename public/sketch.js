const CELL_SIZE = 60;
const MOVE_TIME = 250; // in milliseconds

const START_COLOR = "#f7bc31";
const END_COLOR = "#51db12";
const WALL_COLOR = "#323232";
const PLAYER_COLOR = "#0384fc";
const BAD_COLOR = "#ff0000";
const EMPTY_COLOR = "#c8c8c8";

const EXECUTE_BUTTON_DOM = document.getElementById("execute");
const TEXT_OUTPUT_P_DOM = document.getElementById("text_output_p");
const TEXT_OUTPUT_DOM = document.getElementById("text_output");

let BOARDS;
let currentBoard = {difficulty: "beginner", index: 0};
let originalBoard;
let board;
let boardWidth, boardHeight;
let start, end;
let currentPosition;

let boardOfNodes = [];
let solution;
let moveQueue = [];
let doMoves = false;
let timeSinceLastMove = 0; // in milliseconds

let difficultySelector;
let showEnd = false;

function preload(){
  const jsonURL = "./levels.json"
  BOARDS = loadJSON(jsonURL);
}

function setup() {
	const cnv = createCanvas(100,100);
  cnv.parent('game');
	background(255);

  difficultySelector = select("#difficulty");
  newGame();
}

function draw() {
  timeSinceLastMove += deltaTime;
  showEnd = document.getElementById("show_end").checked;
  background(255);

  if (timeSinceLastMove > MOVE_TIME && doMoves){
    timeSinceLastMove = 0;
    const currentMove = moveQueue.shift();
    if (currentMove === undefined) {
      doMoves = false;
    } else {
      movePlayer(currentMove);
      console.log(currentMove);
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

  // fill(0);
  // textAlign("center");
  // text("START", screenSpace(start.x), screenSpace(start.y));
  // if (showEnd) text("END", screenSpace(end.x), screenSpace(end.y));
}

async function sendData() {
  const data = {message: "SOLVE THIS", board: originalBoard, width: boardWidth, height: boardHeight, start: start, end: end}; 
  const options = {
      method: "POST",
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  };

  const response = await fetch('/api', options);
  const responseData = await response.json();

  console.log(responseData);
  solution = responseData.solution;
  setServerDomState(true);
}

function executeSolution() {
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
      y: Math.floor(unnestedSolution/boardHeight)
    })
  }

  // fill up move queue with the difference between each step in solutionAsCoords, essentially the input instructions
  //let deltaX, deltaY;
  for (let i = 1; i < solutionAsCoords.length; i++) { // start at 1 because the first item in solutions is the starting position
    moveQueue.push(subtractVector(solutionAsCoords[i], solutionAsCoords[i-1]));
  }

  doMoves = true;
  setBoard(currentBoard.difficulty, currentBoard.index);
}

function setServerDomState(enabled) {
  if (enabled) {
    TEXT_OUTPUT_P_DOM.innerHTML = "Below is the solution:";
    TEXT_OUTPUT_DOM.innerHTML = solution.toString().replaceAll(",", " > ");
  } else {
    TEXT_OUTPUT_P_DOM.innerHTML = "Press the solve button above to get the solution.";
    TEXT_OUTPUT_DOM.innerHTML = "";
  }
  TEXT_OUTPUT_DOM.disabled = !enabled;
  EXECUTE_BUTTON_DOM.disabled = !enabled;
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
    
    // if (areVectorsEqual(currentPosition, end)) {
      checkForFullBoard() ? alert("You won!") : null;
    // }
  }
}

function undoMove(){
  const lastMove = getCellValue(currentPosition);
  // make sure the current cell is not a start or end cell
  if (typeof(lastMove) !== "string") {
    setCellValue(currentPosition, null);
    currentPosition = subtractVector(currentPosition, lastMove);
  }
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
        restart();
      default:
        //console.log(keyCode);
    }
  }
}

function newGame(){
  const difficulty = difficultySelector.value();
  let boardsOfDifficulty = Object.keys(BOARDS[difficulty]);

  if (boardsOfDifficulty.length > 1) {
    boardsOfDifficulty.splice(currentBoard.index.toString(), 1);
  }
  setBoard(difficulty, random(boardsOfDifficulty));
  doMoves = false;
  moveQueue = [];

  let boardIndex = 0;
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

  setServerDomState(false);
}
function restart(){
  setBoard(currentBoard.difficulty, currentBoard.index);
  doMoves = false;
  moveQueue = [];
}

function setBoard(difficulty, index){
  currentBoard = {difficulty: difficulty, index: index};
  p = BOARDS[difficulty][index];
  originalBoard = p.board;

  boardWidth = p.width;
  boardHeight = p.height;

  start = p.start;
  end = p.end;
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

  resizeCanvas(boardWidth*CELL_SIZE, boardHeight*CELL_SIZE);
}