const CELL_SIZE = 60;
const MOVE_TIME = -1;

const START_COLOR = "#f7bc31";
const END_COLOR = "#51db12";
const WALL_COLOR = "#323232";
const PLAYER_COLOR = "#0384fc";
const BAD_COLOR = "#ff0000";
const EMPTY_COLOR = "#c8c8c8";

let BOARDS;
let currentBoard = {difficulty: "beginner", index: 0};
let originalBoard;
let board;
let boardWidth, boardHeight;
let start, end;
let currentPosition;
let timeSinceLastMove = 0; // in milliseconds

let difficultySelector, restartButton, newGameButton;
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
  restartButton = select("#restart");
  newGameButton = select("#new_game");

  restartButton.mouseClicked(restart);
  newGameButton.mouseClicked(newGame);
  newGame();
}

function draw() {
  timeSinceLastMove += deltaTime;
  showEnd = document.getElementById("show_end").checked;
  background(255);

  if (timeSinceLastMove > MOVE_TIME && MOVE_TIME > 0){
    timeSinceLastMove = 0;
    console.log("moving");
    movePlayer({x: 0 , y: 0});
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

  push();
  fill(0);
  textAlign("center");
  let cellIndex = 0;
  for (let y = 0; y < boardHeight; y++){
    for (let x = 0; x < boardWidth; x++){
      if (originalBoard[y][x] !== 1) {
        text(cellIndex, screenSpace(x), screenSpace(y));
        cellIndex++;
      }
    }
  }
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
  let nodesOutput = "";
  for (let i = 0; i < responseData.graph.length; i++) {
    nodesOutput += responseData.graph[i];
    nodesOutput += ";\n";
  }
  document.getElementById("nodes_output").innerHTML = nodesOutput;
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
    case 82: // R key
      restart();
    default:
      //console.log(keyCode);
  }
}

function newGame(){
  const difficulty = difficultySelector.value();
  let boardsOfDifficulty = Object.keys(BOARDS[difficulty]);

  if (boardsOfDifficulty.length > 1) {
    boardsOfDifficulty.splice(currentBoard.index.toString(), 1);
  }
  setBoard(difficulty, random(boardsOfDifficulty));
}
function restart(){
  setBoard(currentBoard.difficulty, currentBoard.index);
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