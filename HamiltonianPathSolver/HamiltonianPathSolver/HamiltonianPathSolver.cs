namespace HamiltonianPathSolver
{
    internal class HamiltonianPathSolver
    {
        static Board? board;

        public static int Main(string[] args)
        {
            if (args == null || args.Length < 1) throw new Exception("No path specified in args!");

            Console.WriteLine("Starting solver on file " + args[0]);

            // Create the board 
            string path = args[0];
            string content = File.ReadAllText(path);
            board = Newtonsoft.Json.JsonConvert.DeserializeObject<Board>(content);
            if (board == null || !board.IsValid()) return -1;

            Console.WriteLine(board);
            Solution solution = board.Solve();
            Console.WriteLine(solution);

            return 0;
        }
    }
}