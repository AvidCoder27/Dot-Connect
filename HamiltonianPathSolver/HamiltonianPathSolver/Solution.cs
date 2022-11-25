namespace HamiltonianPathSolver
{
    public class Solution
    {
        private string stepsAsString;
        public List<int> steps;
        public Status status;
        public uint executionTimeMilliseconds;
        public enum Status
        {
            Success,
            NoSolution,
            Unsolved
        }

        public Solution()
        {
            steps = new List<int>();
            status = Status.Unsolved;
            stepsAsString = string.Empty;
        }
        public Solution(List<int> steps, Status status)
        {
            this.steps = steps;
            this.status = status;
            stepsAsString = string.Join(" > ", steps.ToArray());
        }

        public override string ToString()
        {
            switch (status)
            {
                case Status.Success:
                    return "solution in " + executionTimeMilliseconds + " ms:\n" + stepsAsString;
                case Status.NoSolution:
                    return "NO solution in " + executionTimeMilliseconds + " ms:\n";
                case Status.Unsolved:
                    return "Board has not been solved! Run the Board.Solve() method to solve it.";
                default:
                    return "MISSING_STATUS\n";
            }
        }
    }
}
