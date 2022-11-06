const express = require('express');
const app = express();

app.listen(3000, () => console.log('listening on port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post("/api", (request, response) => {
    console.log("Request recieved: " + request.body.message);
    
    const solution = solveBoard(request.body.board, request.body.width, request.body.height, request.body.start, request.body.end);

    response.json({
        status: "success",
        solution: solution,
    });
});

function solveBoard(board, width, height, start, end) {
    console.log("Starting solver...");

    let graph = graphFromGrid(board, width, height);

    console.log("Solved!");
    return graph;
}

function graphFromGrid(g, width, height){
    let nodes = [];

    let numberOfNodes = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++){
            if (g[y][x] === 1) { // if it's a wall
                g[y][x] = "#"
            } else {
                g[y][x] = numberOfNodes;
                nodes.push([]);
                numberOfNodes ++;
            }
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++){
            if (g[y][x] !== "#") { // if not wall
                for (let i = 0; i < numberOfNodes; i++) { 
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

    return nodes;
}

function isNode(a, x, y){
    if (y >= a.length || y < 0 || x > a[0].length || x < 0) { // check if out-of-bounds
        return false;
    }
    return a[y][x] !== "#";
}