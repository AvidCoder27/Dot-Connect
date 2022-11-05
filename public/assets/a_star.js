class Astar {
    constructor(startPos, goal, board){
        this.goal = goal;
        this.openList = [];
        this.closedList = [];

        this.board = board;

        this.openList.push({
            x: startPos.x,
            y: startPos.y,
            f: 0,
            g: null,
            h: null
        });
    }

    execute(){
        if(this.openList.length > 0) {
            let qIndex = this.findNodeWithLeastF(this.openList); // find q
            let q = {...this.openList[qIndex]}; // create q from a clone of the element from the open list
            delete this.openList[qIndex]; // delete q from the open list
            
            // create successors in the four directions from q
            let successors = [
                { x: q.x + 1,   y: q.y,     f: null, g: null, h: null },
                { x: q.x - 1,   y: q.y,     f: null, g: null, h: null },
                { x: q.x,       y: q.y + 1, f: null, g: null, h: null },
                { x: q.x,       y: q.y - 1, f: null, g: null, h: null },
            ];

            for (let i = 0; i < successors.length; i++) {
                let successor = successors[i];

                // check if the successor is out of bounds or in a wall
                if (successor.y >= this.board.length || successor.y < 0 ||
                    successor.x >= this.board[0].length || successor.x < 0 ||
                    this.board[successor.y][successor.x] === 1
                    ){
                    continue;
                }

                if ({x: successor.x, y: successor.y} === this.goal){
                    return "GOAL";
                } else {
                    successor.g = q.g + 1;

                    successor.h = Math.abs(successor.x - this.goal.x) + Math.abs(successor.y - this.goal.y);

                    successor.f = successor.g + successor.h;
                }

                this.openList = this.openList.filter(elm => elm);
                this.closedList = this.closedList.filter(elm => elm);

                if (this.openList.length > 0) {
                    if (this.findNodeWithLeastF(this.openList)) {
                        console.log("continue on open list");
                        continue; // skip this successor
                    }
                }
                
                if (this.closedList.length > 0) {
                    if (this.findNodeWithLeastF(this.closedList)){
                        console.log("continue on closed list");
                        continue;
                    }
                    else this.openList.push(successor);
                } else this.openList.push(successor);
            }

            this.closedList.push(q);
            return {open: this.openList, closed: this.closedList};
        }
    }

    findNodeWithLeastF(l){
        let leastF = 999999; // really high value so that it will always be beat
        let returnIndex = null; 

        for(let i = 0; i < l.length; i++) {
            if (l[i].f < leastF) {
                leastF = l[i].f;
                returnIndex = i;
            }
        }

        return returnIndex;
    }

    getOpenList(){
        return this.openList;
    }
}

function runAstar(){
    let returnValue = aStar.execute();
    if (returnValue === "GOAL"){
      timeSinceLastMove = -9999999;
      alert("Reached the end");
    } else {
      for (let i = 0; i < returnValue.open.length; i++){
        setBoardValue(returnValue.open[i], 2);
      }
      for (let i = 0; i < returnValue.closed.length; i++){
        setBoardValue(returnValue.closed[i], 3);
      }
    }
  }