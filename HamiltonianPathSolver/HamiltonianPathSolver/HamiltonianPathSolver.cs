using System.Threading;
using System.Threading.Tasks;

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

            Console.WriteLine("Starting solver on file " + path);
            originalBoard = Newtonsoft.Json.JsonConvert.DeserializeObject<Board>(content);
            if (originalBoard == null || !originalBoard.IsValid()) return -1;
            Console.WriteLine(originalBoard);

            CancellationTokenSource cts = new CancellationTokenSource();
            Parallel.For(6, 18, index =>
            {
                Thread thisThread = Thread.CurrentThread;
                thisThread.Name = "Thread " + index;
                Solution solution = originalBoard.GetCopy().Solve(index);
                Console.WriteLine($"\n{thisThread.Name}: {solution}");
            });

            return 0;
        }
    }
}