using staj.Data;

namespace staj.Services
{
    using NetTopologySuite.IO;
    using staj;

    public class CoordinateUnitOfWorkService : ICoordinateService
    {
        private readonly IUnitOfWork _unitOfWork;
        //Dependency Injection: CoordinatesService sınıfı, IUnitOfWork arayüzünü kullanarak Unit of Work pattern'ini uygular.
        public CoordinateUnitOfWorkService(IUnitOfWork unitOfWork)//constructor injection
        {

            _unitOfWork = unitOfWork;
        }

        public Response Get()
        {
            var result = new Response();
            try
            {
                result.Data = _unitOfWork.Coordinates.Get();
                result.IsSuccess = true;
                result.Message = "All coordinates returned successfully! ";
            }
            catch (Exception ex)
            {
                result.Message = "Something went wrong!";
            }
            return result;
        }

        public Response Add(CoordinateDto k)
        {
            var result = new Response();
            try
            {
                var wktReader = new WKTReader();
                var geometry = wktReader.Read(k.Wkt);
                var coordinate = new Coordinate()
                {
                    Id = Guid.NewGuid(),
                    Geo = geometry,
                    Name = k.Name,
                };

                // As a unique ID, Guid usage
                _unitOfWork.Coordinates.Add(coordinate);
                _unitOfWork.Save();
                result.Data = coordinate;
                result.IsSuccess = true;
                result.Message = "Coordinate added successfully.";
            }
            catch (Exception ex)
            {
                result.Message = "Something went wrong!";
            }
            return result;
        }

        public Response GetById(Guid id)
        {
            var result = new Response();
            try
            {
                var coordinate = _unitOfWork.Coordinates.GetById(id);
                if (coordinate == null)
                {
                    result.Message = "The coordinate not found!";
                }
                result.Data = coordinate;
                result.IsSuccess = true;
            }
            catch (Exception ex)
            {
                result.Message = "Something went wrong!";
            }
            return result;
        }

        public Response Update(Guid id, CoordinateDto k)
        {
            var result = new Response();
            try
            {
                var coordinate = _unitOfWork.Coordinates.GetById(id);
                if (coordinate == null)
                {
                    result.Message = "The coordinate not found!";
                }
                else
                {
                    var wktReader = new WKTReader();
                    coordinate.Name = k.Name;
                    coordinate.Geo = wktReader.Read(k.Wkt);
                    _unitOfWork.Coordinates.Update(coordinate);
                    _unitOfWork.Save();
                    result.Data = coordinate;
                    result.IsSuccess = true;
                    result.Message = "Coordinate updated successfully.";
                }
            }
            catch (Exception ex)
            {
                result.Message = "Something went wrong! ";
            }
            return result;
        }

        public Response Delete(Guid id)
        {
            var result = new Response();
            try
            {
                var coordinate = _unitOfWork.Coordinates.GetById(id);
                if (coordinate == null)
                {
                    result.Message = "Coordinate not found!";
                }
                else
                {
                    _unitOfWork.Coordinates.Delete(id);
                    _unitOfWork.Save();
                    result.IsSuccess = true;
                    result.Message = "Coordinate deleted successfully!";
                }
            }
            catch (Exception ex)
            {
                result.Message = "Something went wrong!";
            }
            return result;
        }
    }

}
