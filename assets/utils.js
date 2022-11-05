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
        if (showEnd) return END_COLOR;
        return EMPTY_COLOR;
    }
}

function checkForFullBoard(){
    for (let y = 0; y < boardHeight; y++) for (let x = 0; x < boardWidth; x++) if (!board[y][x]) return false;
    return true;
}