﻿using System.Diagnostics;

namespace HamiltonianPathSolver
{
    public class Board
    {
        public List<List<int>> board { get; set; }
        public _start start { get; set; }
        public int width { get; set; }
        public int height { get; set; }
        public int startIndex { get; private set; }
        public int numberOfNodes { get; private set; }
        public List<List<int>> graph { get; private set; }
        public List<int> xList { get; private set; }

        public Board()
        {
            board = new List<List<int>>();
            graph = new List<List<int>>();
            xList = new List<int>();
            start = new _start();
        }

        public override string ToString()
        {
            string output = "Board:\n";
            foreach (List<int> row in board)
            {
                foreach (int elem in row)
                {
                    char c = '·';
                    if (elem == 1) c = '■';
                    else if (elem == 8) c = 'S';
                    output += c + " ";
                }
                output += "\n";
            }
            output += "Start: " + start + "\nWidth: " + width + "\nHeight: " + height;
            return output;
        }

        public Solution Solve()
        {
            Stopwatch stopwatch = new Stopwatch();

            stopwatch.Start();
            Solution solution = PrivateSolve();
            stopwatch.Stop();

            solution.executionTimeMilliseconds = stopwatch.ElapsedMilliseconds;
            return solution;
        }

        private Solution PrivateSolve()
        {
            SetGraphFromBoard();

            xList = new List<int>();
            xList.Add(startIndex);
            for (int i = 1; i < numberOfNodes; i++) xList.Add(-1);
            int posX = 1;

            // loop while the current position is in the X list; once it isn't, then it's found a solution
            while (posX < xList.Count)
            {
                // set the possible k to be the nodes that can be reached from the previous node in xList
                // it's really a pointer to the graph, but it shouldn't be modified.
                // It would be a const, but that would involve copying the the element in graph
                // And that would take valuable processing time
                List<int> possibleK = graph[xList[posX - 1]];
                bool kFound = false;

                int i;
                if (xList[posX] == -1) // we've never been here before, sort of, recently?
                    i = 0;
                else
                {
                    // we're backtracking into this spot in X list, so set i to the next index of the next item
                    int suggestedI = possibleK.IndexOf(xList[posX]) + 1;
                    if (suggestedI >= possibleK.Count)
                    {
                        // the suggestedI is larger than the size of possibleK:
                        // we've exhausted possibleK, so we need to backtrack again
                        xList[posX] = -1; // reset spot we're on to -1
                        posX--;
                        if (posX == 0)
                        {
                            // we're back at the beginning of the Sol list, therefore there is no solution
                            Console.WriteLine("first backtrack");
                            return new Solution(xList, Solution.Status.NoSolution);
                        }
                        else continue; // go back to the start of the big while loop
                    }
                    i = possibleK.IndexOf(xList[posX]) + 1;
                }

                while (i < possibleK.Count)
                {
                    // if the current possible K is already in the X list,
                    if (xList.Contains(possibleK[i]))
                    {
                        i++; // try the next i
                        continue;
                    } else
                    {
                        // we've found a k that: 1) connects to the previous node and
                        // 2) isn't already in the X list
                        kFound = true;
                        break;
                    }
                }

                if (kFound)
                {
                    xList[posX] = possibleK[i]; // set the spot we're on to the chosen K
                    posX++;
                } else
                {
                    // if we've not found a suitable K, then we have to backtrack
                    xList[posX] = -1;
                    posX--;
                    if (posX == 0)
                    {
                        // we're back at the beginning of the X list, therefore there is no solution
                        Console.WriteLine("second backtrack");
                        return new Solution(xList, Solution.Status.NoSolution);
                    }
                }
            }

            return new Solution(xList, Solution.Status.Success);
        }

        private bool SetGraphFromBoard()
        {
            startIndex = -1;
            numberOfNodes = 0;
            // Grid is a 2d list that keeps track of the node # of each cell. -1 means the cell is a wall
            List<List<int>> grid = new List<List<int>>(board);

            // Fill up graph with a list for each non-wall/ node
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    if (grid[y][x] == 1)
                        grid[y][x] = -1; // cell is a wall
                    else {
                        if (grid[y][x] == 8) startIndex = numberOfNodes;

                        grid[y][x] = numberOfNodes;
                        graph.Add(new List<int>());
                        numberOfNodes++;
                    }
                }
            }

            if (startIndex == -1) return false; // Missing a start

            // For each node in graph: fill its list with the node #s of the adjacent nodes
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    if (grid[y][x] != -1) //if not a wall
                    {
                        // Checks spot above, below, right, and left to see if it's a valid node
                        // If it is, it puts it's node # into the current node's list in graph
                        
                        if (IsNode(grid, x +0, y -1)) // Above
                            graph[grid[y][x]].Add(grid[y -1][x +0]);

                        if (IsNode(grid, x +0, y +1)) // Below
                            graph[grid[y][x]].Add(grid[y +1][x +0]);

                        if (IsNode(grid, x +1, y +0)) // Right
                            graph[grid[y][x]].Add(grid[y +0][x +1]);

                        if (IsNode(grid, x -1, y +0)) // Right
                            graph[grid[y][x]].Add(grid[y +0][x -1]);
                    }
                }
            }
            
            return true;
        }

        private bool IsNode(List<List<int>> a, int x, int y)
        {
            // False if out-of-bounds or cell is a wall
            return !(y >= a.Count || y < 0 || x >= a[0].Count || x < 0 || a[y][x] == -1);
        }
    }

    public class _start
    {
        // This class is just for storing the XY pair for the start
        public int x { get; private set; }
        public int y { get; private set; }

        public override string ToString()
        {
            return string.Format("({0}, {1})", x, y);
        }
    }
}