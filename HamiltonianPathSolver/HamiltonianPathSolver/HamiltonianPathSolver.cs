namespace HamiltonianPathSolver
{
    internal class HamiltonianPathSolver
    {
        static Board? originalBoard;

        public static void Main(string[] args)
        {
            if (args == null || args.Length < 1) throw new Exception("No path specified in args!");
            string path = args[0];
            string content = File.ReadAllText(path);

            Console.WriteLine("\nStarting solver on file " + path);
            Solution solution = SolveJsonString(content);

            Console.WriteLine();
            switch (solution.status)
            {
                case Solution.Status.Success:
                    Console.WriteLine(solution.stepsAsString);
                    break;
                case Solution.Status.NoSolution:
                    Console.WriteLine("Board has no solution");
                    break;
                case Solution.Status.InvalidBoard:
                    Console.WriteLine("JSON was not a valid board");
                    break;
                case Solution.Status.Unsolved:
                default:
                    Console.WriteLine("SOMETHING WENT WRONG. The board was not solved");
                    break;
            }
        }

        public static Solution SolveJsonString(string jsonString)
        {
            Solution finalSolution = new ();

            // create board
            try
            {
                originalBoard = Newtonsoft.Json.JsonConvert.DeserializeObject<Board>(jsonString);
                if (originalBoard == null || !originalBoard.IsValid())
                    throw new Newtonsoft.Json.JsonReaderException();
            }
            catch (Newtonsoft.Json.JsonReaderException)
            {
                finalSolution.status = Solution.Status.InvalidBoard;
                return finalSolution;
            }

            Console.WriteLine(originalBoard);

            // setup parallel options
            CancellationTokenSource cts = new();
            ParallelOptions po = new()
            {
                CancellationToken = cts.Token,
                MaxDegreeOfParallelism = Environment.ProcessorCount
            };

            try
            {
                Parallel.For(0, 24, po, index =>
                {
                    Thread thisThread = Thread.CurrentThread;
                    thisThread.Name = "Thread" + index;

                    Solution solution = originalBoard.GetCopy().Solve(index, po.CancellationToken);
                    finalSolution = solution;

                    // converts the char array to a string
                    string priorityString = new (Board.GetPrioritizationFromIndex(index));
                    //Console.WriteLine($"\n\n{thisThread.Name} used {priorityString} to find {solution}");
                    Console.WriteLine($"\n{thisThread.Name} finished in {solution.executionTimeMilliseconds}ms with priority of {priorityString}");

                    cts.Cancel();
                    Console.WriteLine("Cancelled token source.");

                });
            }
            catch (OperationCanceledException e)
            {
                Console.WriteLine(e.Message);
            }
            finally
            {
                cts.Dispose();
            }

            return finalSolution;
        }
    }
}