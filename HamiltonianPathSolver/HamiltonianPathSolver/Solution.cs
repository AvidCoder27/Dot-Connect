namespace HamiltonianPathSolver
{
    public class Solution
    {
        public List<int> steps { get; private set; }
        public Status status { get; private set; }
        public long executionTimeMilliseconds { get; set; }
        public enum Status
        {
            Success,
            NoSolution
        }

        public Solution(List<int> steps, Status status)
        {
            this.steps = steps;
            this.status = status;
        }

        public override string ToString()
        {
            switch (status)
            {
                case Status.Success:
                    return "Solution Found in " + executionTimeMilliseconds + " ms:\n" + String.Join(" > ", steps.ToArray());
                case Status.NoSolution:
                    return "No Solution Found in " + executionTimeMilliseconds + " ms:\n";
                default:
                    return "MISSING_STATUS\n";
            }
        }
    }
}
