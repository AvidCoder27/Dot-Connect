namespace HamiltonianPathSolver
{
    internal class HamiltonianPathSolver
    {
        static Board? board;

        public static int Main(string[] args)
        {
            Console.WriteLine("Starting solver...");

            // Create the board 
            string path = @"C:\Users\Gili\Documents\C#\HamiltonianPathSolver\HamiltonianPathSolver\board.txt";
            string content = File.ReadAllText(path);
            board = Newtonsoft.Json.JsonConvert.DeserializeObject<Board>(content);
            Console.WriteLine(board);

            if (board == null || board.startIndex == -1) return -1;
            Solution solution = board.Solve();
            Console.WriteLine(solution);

            return 0;
        }
    }
}