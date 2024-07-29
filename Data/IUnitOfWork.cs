using staj.Repositories;

namespace staj.Data

{ 
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Coordinate> Coordinates { get; }
        void Save();
    }
}