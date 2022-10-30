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

let boardSelector, restartButton, newGameButton;

function preload(){
  BOARDS = loadJSON('./levels.json');
}

function setup() {
	createCanvas(100,100);
	background(255);

  boardSelector = select("#choose_level");
  restartButton = select("#restart");
  newGameButton = select("#new_game");

  restart();
}

function draw() {
  timeSinceLastMove += deltaTime;
  background(255);

  if (timeSinceLastMove > MOVE_TIME && MOVE_TIME > 0){
    timeSinceLastMove = 0;
    console.log("moving");
    move({x: 0 , y: 0});
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

  fill(0);
  textAlign("center");
  text("START", screenSpace(start.x), screenSpace(start.y));
  text("END", screenSpace(end.x), screenSpace(end.y));
}

function move(direction){ // {x: horizontal, y: vertical}
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
    
    if (areVectorsEqual(currentPosition, end)) {
      checkForFullBoard() ? alert("You won!") : null;
    }
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

function checkForFullBoard(){
  for (let y = 0; y < boardHeight; y++) for (let x = 0; x < boardWidth; x++) if (!board[y][x]) return false;
  return true;
}

function keyPressed(){
  switch(keyCode) {
    case LEFT_ARROW:
      move({x: -1, y: 0});
      break;
    case RIGHT_ARROW:
      move({x: 1, y: 0});
      break;
    case UP_ARROW:
      move({x: 0, y: -1});
      break;
    case DOWN_ARROW:
      move({x: 0, y: 1});
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

function getColorOfCell(x, y, l){
  switch (l[y][x]) {
    case 0:
      return EMPTY_COLOR;
    case 1:
      return WALL_COLOR;
    case 2:
      return PLAYER_COLOR;
    case 3:
      return BAD_COLOR;
    case 8:
      return START_COLOR;
    case 9:
      return END_COLOR;
  }
}

function restart(){
  setBoard(currentBoard.difficulty, currentBoard.index);
}

function setBoard(difficulty, index){
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

setCellValue = (xyPair, value) => board[xyPair.y][xyPair.x] = value;
getCellValue = (xyPair) => board[xyPair.y][xyPair.x];

function addVector(xy1, xy2) {
  return {x: xy1.x + xy2.x, y: xy1.y + xy2.y};
}
function subtractVector(xy1, xy2) {
  return {x: xy1.x - xy2.x, y: xy1.y - xy2.y};
}
function areVectorsEqual(xy1, xy2) {
  return xy1.x === xy2.x && xy1.y === xy2.y;
}

function screenSpace(n){
    return  (n+0.5) * CELL_SIZE;
}