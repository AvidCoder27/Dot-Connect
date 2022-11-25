using System.Diagnostics;

namespace HamiltonianPathSolver
{
    public class Board
    {
        public List<List<int>> board; // a list of lists of #s representing cell types (0,1,8)
        public StartCoordinate start;
        public int width;
        public int height;

        private int startIndex;
        private int numberOfNodes;
        private readonly List<List<int>> graph; // a list of lists of #s representing node indices
        private Solution solution;
        
        public static char[] GetPrioritizationFromIndex(int index)
        {
            switch (index)
            {
                default: return new char[] { 'N', 'E', 'S', 'W' };
                case 00: return new char[] { 'N', 'E', 'S', 'W' };
                case 01: return new char[] { 'E', 'N', 'S', 'W' };
                case 02: return new char[] { 'N', 'S', 'E', 'W' };
                case 03: return new char[] { 'S', 'N', 'E', 'W' };
                case 04: return new char[] { 'E', 'S', 'N', 'W' };
                case 05: return new char[] { 'S', 'E', 'N', 'W' };
                case 06: return new char[] { 'N', 'E', 'W', 'S' };
                case 07: return new char[] { 'E', 'N', 'W', 'S' };
                case 08: return new char[] { 'N', 'W', 'E', 'S' };
                case 09: return new char[] { 'W', 'N', 'E', 'S' };
                case 10: return new char[] { 'E', 'W', 'N', 'S' };
                case 11: return new char[] { 'W', 'E', 'N', 'S' };
                case 12: return new char[] { 'N', 'S', 'W', 'E' };
                case 13: return new char[] { 'S', 'N', 'W', 'E' };
                case 14: return new char[] { 'N', 'W', 'S', 'E' };
                case 15: return new char[] { 'W', 'N', 'S', 'E' };
                case 16: return new char[] { 'S', 'W', 'N', 'E' };
                case 17: return new char[] { 'W', 'S', 'N', 'E' };
                case 18: return new char[] { 'E', 'S', 'W', 'N' };
                case 19: return new char[] { 'S', 'E', 'W', 'N' };
                case 20: return new char[] { 'E', 'W', 'S', 'N' };
                case 21: return new char[] { 'W', 'E', 'S', 'N' };
                case 22: return new char[] { 'S', 'W', 'E', 'N' };
                case 23: return new char[] { 'W', 'S', 'E', 'N' };
            }
        }

        public Board()
        {
            board = new List<List<int>>();
            graph = new List<List<int>>();
            start = new StartCoordinate(-1, -1);
            solution = new Solution();
        }
        public Board(List<List<int>> board, StartCoordinate start, int width, int height)
        {
            this.board = board;
            this.start = start;
            this.width = width;
            this.height = height;
            graph = new List<List<int>>();
            solution = new Solution();
        }

        public Board GetCopy()
        {
            return new Board(board, start, width, height);
        }

        public bool IsValid()
        {
            if (board.Count != height) return false;
            foreach(List<int> row in board) if (row.Count != width) return false;
            if (start.x < 0 || start.y < 0 || start.x >= width || start.y >= height) return false;
            return true;
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

        public Solution Solve() => Solve(0);
        public Solution Solve(int prioritizationIndex) => Solve(prioritizationIndex, CancellationToken.None);
        public Solution Solve(int prioritizationIndex, CancellationToken cancellationToken)
        {
            if (solution.status == Solution.Status.Unsolved)
            {
                Stopwatch stopwatch = new();

                stopwatch.Start();
                SetGraphFromBoard(GetPrioritizationFromIndex(prioritizationIndex));
                solution = PrivateSolve(cancellationToken);
                stopwatch.Stop();
                solution.executionTimeMilliseconds = (uint) stopwatch.ElapsedMilliseconds;
            }

            return solution;
        }

        private Solution PrivateSolve(CancellationToken cancellationToken)
        {
            //Stopwatch secondaryStopwatch = new();

            // Create xList with startIndex as first element
            // xList is a list of #s representing node indecies
            List<int> xList = new() { startIndex };
            // NOTE: puts in 1 less than the # of nodes b/c the first node is already added
            for (int i = 1; i < numberOfNodes; i++) xList.Add(-1);
            int posX = 1;

            // loop while the current position is in the X list; once it isn't, then it's found a solution
            while (posX < xList.Count)
            {
                // Check for cancellation token
                cancellationToken.ThrowIfCancellationRequested();

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
                    i = possibleK.IndexOf(xList[posX]) + 1;
                    if (i >= possibleK.Count)
                    {
                        // the suggested I is larger than the size of possibleK:
                        // we've exhausted possibleK, so we need to backtrack again
                        xList[posX] = -1; // reset spot we're on to -1
                        posX--;
                        if (posX == 0)
                        {
                            // we're back at the beginning of the X list, therefore there is no solution
                            return new Solution(xList, Solution.Status.NoSolution);
                        }
                        else continue; // go back to the start of the big while loop
                    }
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
                        return new Solution(xList, Solution.Status.NoSolution);
                    }
                }
            }
            //Console.WriteLine("Time on custom thing: " + secondaryStopwatch.ElapsedMilliseconds);
            return new Solution(xList, Solution.Status.Success);
        }

        private bool SetGraphFromBoard(char[] directionPrioritization)
        {
            startIndex = -1;
            numberOfNodes = 0;
            // Grid is a 2d list that keeps track of the node # of each cell. -1 means the cell is a wall
            List<List<int>> grid = new();
            // Deep copy board into grid by looping thru all rows and cloning the List<int>'s
            for (int i = 0; i < height; i++)
                grid.Add(new List<int>( board[i] ));

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
                    if (grid[y][x] != -1) 
                    {
                        //if not a wall
                        // Checks spot above, below, right, and left to see if it's a valid node
                        // If it is, it puts it's node # into the current node's list in graph
                        foreach (char c in directionPrioritization) {
                            switch (c) {
                                case 'N':
                                    if (IsNode(grid, x, y - 1)) graph[grid[y][x]].Add(grid[y - 1][x + 0]);
                                    break;
                                case 'S':
                                    if (IsNode(grid, x, y + 1)) graph[grid[y][x]].Add(grid[y + 1][x + 0]);
                                    break;
                                case 'E':
                                    if (IsNode(grid, x + 1, y)) graph[grid[y][x]].Add(grid[y + 0][x + 1]);
                                    break;
                                case 'W':
                                    if (IsNode(grid, x - 1, y)) graph[grid[y][x]].Add(grid[y + 0][x - 1]);
                                    break;
                            }
                        }
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

    public class StartCoordinate
    {
        // This class is just for storing the XY pair for the start
        public int x { get; set; }
        public int y { get; set; }

        public StartCoordinate(int x, int y)
        {
            this.x = x;
            this.y = y;
        }

        public override string ToString()
        {
            return string.Format("({0}, {1})", x, y);
        }
    }
}