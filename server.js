const express = require('express');
const app = express();

app.listen(3000, () => console.log('listening on port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post("/api", (request, response) => {
    console.log("Request recieved: " + request.body.message);
    
    const returnObject = solveBoard(request.body.board, request.body.width, request.body.height);

    response.json({
        status: returnObject.status,
        time: returnObject.time,
        solution: returnObject.solution,
    });
});

function solveBoard(board, width, height) {
    console.log("Starting solver...");
    const START_TIME = Date.now();
    let elapsedTime = () => Date.now() - START_TIME;
    
    const graphAndStartIndex = graphFromGrid(board, width, height);
    if (graphAndStartIndex === "MISSING START") {
        return {status: 'missing start', time: elapsedTime(), solution: null};
    }
    const graph = graphAndStartIndex.nodes;
    const startIndex = graphAndStartIndex.startIndex;

    const altGraph = new Array(graph.length);
    for (let i = 0; i < graph.length; i++) {
        altGraph[i] =  [];
        for (let j = 0; j < graph.length; j++) {
            if (graph[i][j] === 1) {
                altGraph[i].push(j);
            }
        }
    }
    
    const x = new Array(graph.length).fill(-1);
    x[0] = startIndex;
    let posX = 1;

    // loop while the current position is in the X array; once it isn't, then it's found a solution
    while (posX < x.length) { 
        // set the possible k to be the nodes that can be reached from the previous node in X
        const possibleK = altGraph[x[posX-1]];
        let kFound = false;

        let i;
        if (x[posX] === -1) {
            // we've never been here before, sort of, recently?
            i = 0;
        } else {
            // we're backtracking into this spot in array X, so set i to the next index of the next item
            const suggestedI = possibleK.indexOf(x[posX]) + 1;
            if (suggestedI >= possibleK.length) {
                // the suggestedI is larger than the size of possibleK: we've exhausted possibleK, so we need to backtrack again
                x[posX] = -1; // reset spot we're on to -1
                posX --;
                if (posX === 0) {
                    // we're back at the beginning of the X array, therefore there is no solution
                    console.log("Impossible to solve, took " + elapsedTime() + " ms");
                    return {status: 'fail', time: elapsedTime(), solution: null};
                } else {
                    continue; // go back to the start of the big while loop
                }
            }
            
            i = possibleK.indexOf(x[posX]) + 1;
        }

        while (i < possibleK.length) {
            // if the current possible K is alread in the X array,
            if (x.includes(possibleK[i])) {
                i++; // try the next I
                continue;
            } else {
                // we've found a k that: 1) connects to the previous node and 2) isn't already in the X array
                kFound = true;
                break;
            }
        }

        if (kFound) {
            x[posX] = possibleK[i]; // set the spot we're on to to the chosen K
            posX ++;
        } else {
            // if we've not found a suitable k, then we have to backtrack
            x[posX] = -1; // reset spot we're on to -1
            posX --;
            
            if (posX === 0) {
                // we're back at the beginning of the X array, therefore there is no solution
                console.log("Impossible to solve, took " + elapsedTime() + " ms");
                return {status: 'fail', time: elapsedTime(), solution: null};
            }
        }

    }

    console.log("Solved in " + elapsedTime() + " ms");
    return {status: 'success', time: elapsedTime(), solution: x};
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

    if (startIndex === undefined) {
        return "MISSING START";
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