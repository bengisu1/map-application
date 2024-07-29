//using Microsoft.AspNetCore.Mvc;

//namespace staj.Services
//{
//    public class CoordinatesService : ICoordinateService
//    {
//        private static readonly List<Coordinate> coordinateList = new List<Coordinate>();
//        //data management shouldnt be in controller.
//        //readonly, bir alanın yalnızca bir kez, tanımlandığı yerde veya sınıfın constructor metodunda atanabileceğini belirtir

       
//        public Response Get()
//        {
//            var result = new Response();
//            try
//            {
//                result.Data = coordinateList;
//                result.IsSuccess = true;
//                result.Message = "All coordinates returned successfully!";
//            }
//            catch (Exception ex)
//            {

//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }
        
//        public Response Add(CoordinateDto k)
//        {
//            var result = new Response();
//            try
//            {
//                k.Id = Guid.NewGuid();
//               // k.Id = new Random().Next();
//                coordinateList.Add(k);
//                result.Data = k;
//                result.IsSuccess = true;
//                result.Message = "Coordinate added successfully.";
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }

       
//        public Response GetById(Guid id)
//        {
//            var result = new Response();
//            try
//            {
//                var coordinate = coordinateList.FirstOrDefault(k => k.Id == id);
//                if (coordinate == null)
//                {
//                    result.Message = "The coordinate not found!";
//                }

//                result.Data = coordinate;
//                result.IsSuccess = true;

//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }

      
//        public Response Update(Guid id, CoordinateDto k)
//        {
//            var result = new Response();
//            try
//            {
//                var coordinate = coordinateList.FirstOrDefault(k => k.Id == id);
//                if (coordinate == null)
//                {
//                    result.Message = "The coordinate not found!";
//                }
//                result.Data = coordinate;
//                result.IsSuccess = true;
//                result.Message = "Coordinate updated successfully.";
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong! ";
//            }
//            return result;
//        }

//        public Response Delete(Guid id)
//        {
//            var result = new Response();
//            try
//            {
//                var coordinate = coordinateList.FirstOrDefault(k => k.Id == id);
//                if (coordinate == null)
//                {
//                    result.Message = "Coordinate not found!";
//                    return result;
//                }

//                coordinateList.Remove(coordinate);
//                result.IsSuccess = true;
//                result.Message = "Coordinate deleted successfully!";

//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong! " + "${ex.Message}"; 
//            }
//            return result;
//        }
//    }

//}