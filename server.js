const express = require('express');
const app = express();

app.listen(3000, () => console.log('listening on port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post("/api", (request, response) => {
    console.log("Request recieved: " + request.body.message);
    
    const graphAndSolution = solveBoard(request.body.board, request.body.width, request.body.height, request.body.start, request.body.end);

    response.json({
        status: graphAndSolution.status,
        solution: graphAndSolution.solution,
        graph: graphAndSolution.graph,
    });
});

function solveBoard(board, width, height, start, end) {
    console.log("Starting solver...");
    const graphAndStartIndex = graphFromGrid(board, width, height);
    const graph = graphAndStartIndex.nodes;
    const startIndex = graphAndStartIndex.startIndex;

    const x = new Array(graph.length).fill(-1);
    x[0] = startIndex;
    let posX = 1;

    while (posX < x.length) { // loop while the current position is in the X array; once it isn't, then it's found a solution
        let k = x[posX] + 1;

        while (true) {
            // if the suggested value (k) is already in the X array, move on to the next k.
            // OR if the suggested value (k) is not adjacent to the previous item in the X array, move on to the next k.
            if (graph[ x[posX-1] ][k] === 0 || x.includes(k)) { 
                k++;
            } else {
                break;
            }
        }
        
        if (k >= x.length) { // checks if it should backtrack
            x[posX] = -1; //reset back to -1
            posX--; //move back one space in the X array
            // check for backtracking all the way to the beginning of the X array
            if (posX < 1) {
                console.log("No solution found");
                return {status: 'fail', solution: null, graph};
            }
        } else {
            x[posX] = k;
            posX ++;
            // if (posX > x.length) break;
        }
    }

    console.log("Solved!");
    return {status: 'success', graph, solution: x};
}

function graphFromGrid(g, width, height){
    let nodes = [];
    let startIndex = undefined;

    let numberOfNodes = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++){
            if (g[y][x] === 1) { // if it's a wall
                g[y][x] = "#";
            } else {
                if (g[y][x] === 8){ // if it's start, set the startIndex
                    startIndex = numberOfNodes;
                } 
                g[y][x] = numberOfNodes;
                nodes.push([]);
                numberOfNodes ++;
            }
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++){
            if (g[y][x] !== "#") { // if not wall
                for (let i = 0; i < numberOfNodes; i++) {  // populate the node with 0s for every other node
                    nodes[g[y][x]].push(0)
                }

                if (isNode(g, x, y-1)) { // check neighboring position ABOVE in grid
                    // in the nodes array, go to the current node, and set the adjacency value for the ABOVE node to 1
                    nodes[ g[y][x] ][ g[y-1][x] ] = 1;
                }

                if (isNode(g, x, y+1)) { // check neighboring position BELOW in grid
                    // in the nodes array, go to the current node, and set the adjacency value for the BELOW node to 1
                    nodes[ g[y][x] ][ g[y+1][x] ] = 1;
                }

                if (isNode(g, x+1, y)) { // check neighboring position RIGHT in grid
                    // in the nodes array, go to the current node, and set the adjacency value for the RIGHT node to 1
                    nodes[ g[y][x] ][ g[y][x+1] ] = 1;
                }

                if (isNode(g, x-1, y)) { // check neighboring position LEFT in grid
                    // in the nodes array, go to the current node, and set the adjacency value for the LEFT node to 1
                    nodes[ g[y][x] ][ g[y][x-1] ] = 1;
                }

            }
        }
    }
    // const entryPoint = new Array(numberOfNodes + 1).fill(0);
    // entryPoint[startIndex] = 1; // 1 to say it's adjacent to the starting node
    // nodes.push(entryPoint);

    return {nodes, startIndex};
}

function isNode(a, x, y){
    if (y >= a.length || y < 0 || x > a[0].length || x < 0) { // check if out-of-bounds
        return false;
    }
    return a[y][x] !== "#";
}