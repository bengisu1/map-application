namespace staj.Repositories
{
    public interface IRepository<T> where T : class
        // IRepository takes an T object. where says this is a class within T list.
    {
        IEnumerable<T> Get();
        // It is using for returning the elements of a specific collection.
        // Bu, Get metodu tarafından döndürülen verilerin bir dizi veya liste gibi bir koleksiyon olarak geri verilmesini sağlar.
        T GetById(Guid id);
        void Add(T entity);
        void Update(T entity);
        void Delete(Guid id);
    }

}
