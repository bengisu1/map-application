using Microsoft.EntityFrameworkCore;
using staj.Data;

namespace staj.Repositories
{
    //this class is a general Repository application and it capculates the data access transaction 
    public class Repository<T> : IRepository<T> where T : class
    {
        //Generic olabilmesi için T nesnesi aldı. IRepository'den türetiliyor. O da T'den türetiliyor. T de aynı zamanda bir class.
        //<T> bir generic type parameter'dir ve C# dilinde generic'leri (genel tipler) kullanmanın bir yoludur.
        //Generic'ler, belirli bir veri tipi belirtilmeden sınıf, metod veya arayüz tanımlamamıza izin verir.
        //Bu, kodun daha esnek ve yeniden kullanılabilir olmasını sağlar.

        private readonly CoordinateDbContext _context;


        private readonly DbSet<T> _dbSet;

        public Repository(CoordinateDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public IEnumerable<T> Get()
        {
            return _dbSet.ToList();
        }

        public T GetById(Guid id)
        {
            return _dbSet.Find(id);
        }

        public void Add(T entity)
        {
            _dbSet.Add(entity);
        }

        public void Update(T entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Delete(Guid id)
        {
            T entity = _dbSet.Find(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
            }
        }

    }

}
