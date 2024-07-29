using staj.Data;
using staj.Repositories;

namespace staj.Data
{
    public class UnitOfWork : IUnitOfWork

    //Constructor Injection: The UnitOfWork class has a constructor that takes an IUnitOfWork argument.
    //This injects the dependency of CoordinatesDbContext into the UnitOfWork class.
    //By receiving the context through the constructor, UnitOfWork doesn't create it itself, promoting loose coupling.
    {
        private readonly CoordinateDbContext _context;
        private IRepository<Coordinate> _coordinatesRepository;

        public UnitOfWork(CoordinateDbContext context)
        {
            _context = context;
        }

        public IRepository<Coordinate> Coordinates
        {
            get
            {
                return _coordinatesRepository = new Repository<Coordinate>(_context);
            }
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        public void Dispose()
        {
            //// Kaynakları serbest bırakmak için kullanılır
            _context.Dispose();
        }
    }

}
