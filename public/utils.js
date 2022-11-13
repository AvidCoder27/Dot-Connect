const START_COLOR = "#47e652";
const WALL_COLOR = "#323232";
const PLAYER_COLOR = "#0384fc";
const EMPTY_COLOR = "#c8c8c8";

const CELL_SIZE = 60;

function getTimeFormattedHMS() {
  const today = new Date();
  return (
    today.getHours().toString().padStart(2, '0') + ":" + 
    today.getMinutes().toString().padStart(2, '0') + ":" + 
    today.getSeconds().toString().padStart(2, '0')
  );
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

function getColorOfCell(x, y, l){
    switch (l[y][x]) {
      case 0:
        return EMPTY_COLOR;
      case 1:
        return WALL_COLOR;
      case 2:
        return PLAYER_COLOR;
      case 8:
        return START_COLOR;
    }
}

function screenSpace(n){
  return  (n+0.5) * CELL_SIZE;
}
function inverseScreenSpace(n) {
  return Math.round((n / CELL_SIZE) - 0.5);
}

class LevelValidationError extends Error {
  constructor(message){
    super(message);
    this.name = "LevelValidationError";
  }
}