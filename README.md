# Dot-Connect
Game of connecting the dots + solver

This runs on a node server and servers a webpage for the client.
To run locally, use node to run server.js and connect to localhost:3000 in a modern browser to view the webpage.
The server runs the task of solving the board when the client sends a request for it.

In addition to the main webpage (index.html), there is also a level editor that creates a JSON string representing the level.
This can be added to the levels.json file, and index.html needs to be updated in the dropdown to include the new level. <br>
I'm working on adding a way to load in custom levels in the webpage, but they will most likely not be persistent between reloads.
