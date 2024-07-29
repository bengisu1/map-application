namespace staj.Services
{
    public interface ICoordinateService
    {
        Response Get();
        Response GetById(Guid id);
        Response Add(CoordinateDto k);
        Response Update(Guid id, CoordinateDto k);
        Response Delete(Guid id);
    }
}


