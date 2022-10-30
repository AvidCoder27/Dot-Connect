const CELL_SIZE = 60;
const MOVE_TIME = -1;

const START_COLOR = "#f7bc31";
const END_COLOR = "#51db12";
const WALL_COLOR = "#323232";
const PLAYER_COLOR = "#0384fc";
const BAD_COLOR = "#ff0000";
const EMPTY_COLOR = "#c8c8c8";


const BOARD_1 = {
  board: [
    [0,0,0,1,1],
    [0,1,0,0,0],
    [0,0,0,0,0],
    [0,0,1,0,8],
    [0,0,1,9,1]
  ], start: {x:4, y:3}, end: {x:3, y:4},
  width: 5, height: 5
}

const BOARD_2 = {
  board: [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,8,1,0],
    [0,0,0,0,0,1,1,9],
    [0,0,1,0,0,1,1,1],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  ], start: {x:5, y:1}, end: {x:7, y:2},
  width: 8, height: 6
}

const BOARD_3 = {
  board: [
    [0,0,0,0,1,1,9,0,0,1],
    [0,0,0,0,0,0,1,1,0,0],
    [0,1,0,0,0,0,8,1,1,0],
    [0,0,0,0,0,1,1,0,0,0],
    [0,0,1,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ], start: {x:6, y:2}, end: {x:6, y:0},
  width: 10, height: 6
}

const BOARD_4 = {
  board: [
    [0,0,1,9,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,0,0,1,0],
    [0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,1,0,0,1,0],
    [1,0,0,0,0,1,1,8,0,0,1,0],
    [1,0,0,1,0,0,0,0,1,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0],
  ], start: {x:7, y:5}, end: {x:3, y:0},
  width: 12, height: 8
}

const BOARD_5 = {
  board: [
    [9,0,0,0,1,1,0,0,0,0,0,0],
    [1,0,0,0,1,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,0,1],
    [0,0,0,1,0,0,0,0,0,1,0,1],
    [0,1,0,0,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,1,1,0,0,0,0,0],
    [0,1,0,0,0,1,0,0,1,0,0,0],
    [0,0,0,0,0,1,0,0,8,0,0,0],
  ], start: {x:8, y:9}, end: {x:0, y:0},
  width: 12, height: 10
}

const BOARD_6 = {
  board: [
    [1,9,1,0,0,0,0,0,1,0,0,0],
    [1,0,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0,1,0],
    [0,0,0,0,0,1,8,0,0,0,0,0],
    [1,0,0,0,0,0,1,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,0],
    [0,1,1,1,0,1,0,0,1,0,0,1],
    [0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,0,0,0,0]
  ], start: {x:6, y:4}, end: {x:1, y:0},
  width: 12, height: 10
};

let originalBoard;
let board;
let boardWidth, boardHeight;
let start, end;
let currentPosition;
let boardSelector;
let timeSinceLastMove = 0; // in milliseconds

let aStar;

function setup() {
	createCanvas(100,100);
	background(255);

  boardSelector = createSelect(select("#choose_level"));
  boardSelector.changed(restart);

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

function restart(){
  board = [];
  chooseBoard(boardSelector.value());
  currentPosition = {...start};
  resizeCanvas(boardWidth*CELL_SIZE, boardHeight*CELL_SIZE);
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

function chooseBoard(arg){
  let p;
  switch (arg){
    case "1":
      p = {...BOARD_1};
      break;
    case "2":
      p = {...BOARD_2};
      break;
    case "3":
      p = {...BOARD_3};
      break;
    case "4":
      p = {...BOARD_4};
      break;
    case "5":
      p = {...BOARD_5};
      break;
    case "6":
      p = {...BOARD_6};
      break;
    default:
      p = arg;
      break;
  }

  originalBoard = p.board;
  boardWidth = p.width;
  boardHeight = p.height;
  start = p.start;
  end = p.end;

  // create an empty board, except for a player spot at the start position
  for (let y = 0; y < boardHeight; y++) {
    board[y] = []
    for (let x = 0; x < boardWidth; x++) {
      if (originalBoard[y][x] === 1)  board[y][x] = "WL";
      else board[y][x] = null;
    }
  }
  setCellValue(start, "ST");
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