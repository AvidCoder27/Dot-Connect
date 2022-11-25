namespace HamiltonianPathSolver
{
    internal class HamiltonianPathSolver
    {
        static Board? originalBoard;

        public static int Main(string[] args)
        {
            if (args == null || args.Length < 1) throw new Exception("No path specified in args!");
            string path = args[0];
            string content = File.ReadAllText(path);

            Console.WriteLine("\nStarting solver on file " + path);

            // create board
            originalBoard = Newtonsoft.Json.JsonConvert.DeserializeObject<Board>(content);
            if (originalBoard == null || !originalBoard.IsValid()) return -1;
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
                Parallel.For(0, 12, po, index =>
                {
                    Thread thisThread = Thread.CurrentThread;
                    thisThread.Name = "t" + index;
                    Console.Write($"{thisThread.Name}, ");

                    Solution solution = originalBoard.GetCopy().Solve(index, po.CancellationToken);
                    Console.WriteLine($"\n{thisThread.Name} found {solution}");

                    cts.Cancel();
                    Console.WriteLine("Cancelled token source. ");

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

            return 0;
        }
    }
}