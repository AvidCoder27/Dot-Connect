
namespace HamiltonianPathSolver
{
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