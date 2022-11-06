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
    console.log("Starting solver on board:");
    console.log(board);



    console.log("Solved!");
    return null;
}