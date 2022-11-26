namespace HamiltonianPathSolver
{
    public class Solution
    {
        public List<int> steps { get; private set; }
        public Status status { get; set; }
        public uint executionTimeMilliseconds { get; private set; }
        public enum Status
        {
            Success,
            NoSolution,
            InvalidBoard,
            Unsolved
        }

        public Solution()
        {
            steps = new List<int>();
            status = Status.Unsolved;
        }
        public Solution(List<int> steps, Status status)
        {
            this.steps = steps;
            this.status = status;
        }

        public void SetExecutionTime(uint milliseconds)
        {
            executionTimeMilliseconds = milliseconds;
        }

        public string GetStepsAsString()
        {
            return string.Join(" > ", steps.ToArray());
        }
    }
}
