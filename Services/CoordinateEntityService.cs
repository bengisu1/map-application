////using System;
////using System.Collections.Generic;
////using System.Linq;
////using Microsoft.EntityFrameworkCore;
////using staj.Data;


//////Entity Framework, .NET uygulamaları için bir Object-Relational Mapper (ORM) araçtır.
//////ORM, veritabanındaki tabloları ve kayıtları nesneler ve sınıflar olarak temsil eder.
//////Böylece SQL sorguları yazmak yerine nesneler üzerinden veritabanı işlemleri yapabiliriz.

////namespace staj.Services
////{
////    public class CoordinateEntityService : ICoordinateService
////    {
////        private readonly CoordinateDbContext _context;


////        public CoordinateEntityService(CoordinateDbContext context)
////        {
////            _context = context;
////        }

////        public Response Get()
////        {
////            var result = new Response();
////            try
////            {
////                var coordinates = _context.Coordinates.ToList();
////                result.Data = coordinates;
////                result.IsSuccess = true;
////                result.Message = "All coordinates returned successfully!";
////            }
////            catch (Exception ex)
////            {
////                result.Message = "Something went wrong!";
////            }
////            return result;
////        }

////        public Response Add(Coordinate k)
////        {
////            var result = new Response();
////            try
////            {
////                k.Id = Guid.NewGuid();
////                _context.Coordinates.Add(k);
////                _context.SaveChanges();
////                result.Data = k;
////                result.IsSuccess = true;
////                result.Message = "Coordinate added successfully.";
////            }
////            catch (Exception ex)
////            {
////                result.Message = ex.Message;
////            }
////            return result;
////        }

////        public Response GetById(Guid id)
////        {
////            var result = new Response();
////            try
////            {
////                var coordinate = _context.Coordinates.Find(id);
////                if (coordinate != null)
////                {
////                    result.Data = coordinate;
////                    result.IsSuccess = true;
////                }
////                else
////                {
////                    result.Message = "The coordinate not found!";
////                }
////            }
////            catch (Exception ex)
////            {
////                result.Message = "Something went wrong!";
////            }
////            return result;
////        }

////        public Response Update(Guid id, Coordinate k)
////        {
////            var result = new Response();
////            try
////            {
////                var coordinate = _context.Coordinates.Find(id);
////                if (coordinate != null)
////                {
////                    coordinate.X = k.X;
////                    coordinate.Y = k.Y;
////                    coordinate.Name = k.Name;
////                    _context.SaveChanges();
////                    result.IsSuccess = true;
////                    result.Message = "Coordinate updated successfully.";
////                }
////                else
////                {
////                    result.Message = "The coordinate not found!";
////                }
////            }
////            catch (Exception ex)
////            {
////                result.Message = "Something went wrong!";
////            }
////            return result;
////        }

////        public Response Delete(Guid id)
////        {
////            var result = new Response();
////            try
////            {
////                var coordinate = _context.Coordinates.Find(id);
////                if (coordinate != null)
////                {
////                    _context.Coordinates.Remove(coordinate);
////                    _context.SaveChanges();
////                    result.IsSuccess = true;
////                    result.Message = "Coordinate deleted successfully!";
////                }
////                else
////                {
////                    result.Message = "Coordinate not found!";
////                }
////            }
////            catch (Exception ex)
////            {
////                result.Message = "Something went wrong!";
////            }
////            return result;
////        }
////    }
////}








