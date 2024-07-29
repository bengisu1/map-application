//using Npgsql;
//using System.Collections.Generic;
//using System.Data;
//using System.Xml.Linq;

//namespace staj.Services
//{   
//    public class CoordinateNpgSQLService : ICoordinateService
//    {
//        private readonly string _connectionString;

//        public CoordinateNpgSQLService(IConfiguration configuration)
//        {
           
//           var rawConnectionString = configuration.GetConnectionString("DefaultConnection");
//           var password = Environment.GetEnvironmentVariable("POSTGRESQL_PW");
//           _connectionString = rawConnectionString.Replace("${POSTGRESQL_PW}",password);
//        }

//        public Response Get()
//        {
//            var result = new Response();
//            try
//            {
//                using (var conn = new NpgsqlConnection(_connectionString))
//                {
//                    conn.Open();
//                    using (var cmd = new NpgsqlCommand("SELECT * FROM Coordinates", conn))
//                    {
//                        using (var reader = cmd.ExecuteReader())
//                        {
//                            var coordinates = new List<Coordinate>(); // it creates a new list to store the coordinates.
//                            while (reader.Read())
//                            {
//                                coordinates.Add(new Coordinate
//                                {
//                                    Id = reader.GetGuid(0), // index 0, id column
//                                    X = reader.GetDouble(1), // index 1, X column
//                                    Y = reader.GetDouble(2), // index 2, Y column
//                                    Name = reader.GetString(3) // index 3, Name column
//                                });
//                            }
//                            result.Data = coordinates;
//                            result.IsSuccess = true;
//                            result.Message = "All coordinates returned successfully!";
//                        }
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong";
//            }
//            return result;
//        }


//        public Response Add(Coordinate k)
//        {
//            var result = new Response();
//            try
//            {
//                using (var conn = new NpgsqlConnection(_connectionString))
//                {
//                    conn.Open();  
//                    using (var cmd = new NpgsqlCommand("INSERT INTO Coordinates (X, Y, Name, id) VALUES (@X, @Y, @Name, @id) RETURNING Id", conn))
//                    {
//                        // INSERT INTO Coordinates (X, Y, Name) VALUES (40.7128, -74.0060, 'New York');
//                        // INSERT INTO Coordinates(X, Y, Name) VALUES(34.0522, -118.2437, 'Los Angeles');
                        
//                        cmd.Parameters.AddWithValue("X", k.X);
//                        cmd.Parameters.AddWithValue("Y", k.Y);
//                        cmd.Parameters.AddWithValue("Name", k.Name);
//                        var id = Guid.NewGuid();
//                        cmd.Parameters.AddWithValue("id", id);
//                        k.Id = id;
//                        cmd.ExecuteNonQuery();
//                        result.Data = k;
//                        result.IsSuccess = true;
//                        result.Message = "Coordinate added successfully.";
//                    }
//                }
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
//                using (var conn = new NpgsqlConnection(_connectionString))
//                {
//                    conn.Open();
//                    using (var cmd = new NpgsqlCommand("SELECT * FROM Coordinates WHERE Id = @Id", conn))
//                    {
//                        //SELECT * FROM Coordinates = selects all columns from the Coordinates table.
//                        cmd.Parameters.AddWithValue("Id", id);
//                        cmd.ExecuteNonQuery();
//                        using (var reader = cmd.ExecuteReader())
//                        {
//                            if (reader.Read())
//                            {
//                                var coordinate = new Coordinate
//                                {
//                                    Id = reader.GetGuid(0),
//                                    X = reader.GetDouble(1),
//                                    Y = reader.GetDouble(2),
//                                    Name = reader.GetString(3)
//                                };
//                                result.Data = coordinate;
//                                result.IsSuccess = true;
//                            }
//                            else
//                            {
//                                result.Message = "The coordinate not found!";
//                            }
//                        }
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }

//        public Response Update(Guid id, Coordinate k)
//        {
//            var result = new Response();
//            try
//            {
//                using (var conn = new NpgsqlConnection(_connectionString))
//                {
//                    conn.Open();
                    
//                    using (var cmd = new NpgsqlCommand("UPDATE Coordinates SET X = @X, Y = @Y, Name = @Name WHERE Id = @Id", conn))
//                    {
//                        //UPDATE Coordinates = table that we want to update.
//                        //SET X = @X, Y = @Y, Name = @Name  = this defines columns that we want to update and arrange the parameter values.
//                        //WHERE Id = @Id  = this only updates rows whose "Id" column matches the value of the `@Id` parameter.
//                        cmd.Parameters.AddWithValue("X", k.X);
//                        cmd.Parameters.AddWithValue("Y", k.Y);
//                        cmd.Parameters.AddWithValue("Name", k.Name);
//                        cmd.Parameters.AddWithValue("Id", id);
//                        int rowsAffected = cmd.ExecuteNonQuery();
//                        if (rowsAffected > 0)
//                        {
//                            result.IsSuccess = true;
//                            result.Message = "Coordinate updated successfully.";
//                        }
//                        else
//                        {
//                            result.Message = "The coordinate not found!";
//                        }
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }

//        public Response Delete(Guid id)
//        {
//            var result = new Response();
//            try
//            {
//                using (var conn = new NpgsqlConnection(_connectionString))
//                {
//                    conn.Open();
//                    using (var cmd = new NpgsqlCommand("DELETE FROM Coordinates WHERE Id = @Id::uuid", conn))
//                    {
//                        //DELETE FROM = it deletes specific rows from a table (removes only targeted rows based on where condition), preserves the table structure
//                        //DROP TABLE = it deletes the entire table and its data permanently.
//                        cmd.Parameters.AddWithValue("Id", id);
//                        int rowsAffected = cmd.ExecuteNonQuery();
//                        if (rowsAffected > 0)
//                        {
//                            result.IsSuccess = true;
//                            result.Message = "Coordinate deleted successfully!";
//                        }
//                        else
//                        {
//                            result.Message = "Coordinate not found!";
//                        }
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                result.Message = "Something went wrong!";
//            }
//            return result;
//        }
//    }
//}

