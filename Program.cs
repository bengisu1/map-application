using staj.Services;

using Microsoft.EntityFrameworkCore;
using staj.Repositories;
using staj.Data;

var builder = WebApplication.CreateBuilder(args);

//// CORS ayarlarý ekleme
//builder.Services.AddCors();

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new GeometryConverter());
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddSingleton<CoordinatesService>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var password = Environment.GetEnvironmentVariable("POSTGRESQL_PW");
connectionString = connectionString.Replace("${POSTGRESQL_PW}", password);

// Add Entity Framework Core
builder.Services.AddDbContext<CoordinateDbContext>(options => options.UseNpgsql(connectionString, x => x.UseNetTopologySuite()));


// Register Unit of Work and Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
//builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
//builder.Services.AddScoped<ICoordinateService, CoordinatesService>();



//builder.Services.AddScoped<ICoordinateService, CoordinateEntityService>();
builder.Services.AddScoped<ICoordinateService, CoordinateUnitOfWorkService>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MapApp API V1");
        c.RoutePrefix = "swagger";
    });
}


//// CORS politikalarýný uygulama
//app.UseCors(builder => builder
//    .AllowAnyOrigin()
//    .AllowAnyHeader()
//    .AllowAnyMethod());

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors(builder => { 
    builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();

});

app.MapControllers();

app.Run();









//using staj.Data;
//using staj.Services;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.FileProviders;
//using staj.Data;
//using staj.Services;

//namespace staj

//{
//    public class Program
//    {
//        public static void Main(string[] args)
//        {
//            var builder = WebApplication.CreateBuilder(args);

//            builder.Services.AddControllers();
//            builder.Services.AddEndpointsApiExplorer();
//            builder.Services.AddSwaggerGen();

//            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//            var dbPassword = Environment.GetEnvironmentVariable("POSTGRESQL_DB_PW");
//            connectionString = connectionString.Replace("${POSTGRESQL_DB_PW}", dbPassword);

//            builder.Services.AddDbContext<CoordinateDbContext>(options => options.UseNpgsql(connectionString));

//            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
//            builder.Services.AddScoped<ICoordinateService, CoordinateUnitOfWorkService>();

//            var app = builder.Build();

//            app.UseHttpsRedirection();

//            app.UseDefaultFiles();
//            app.UseStaticFiles();

//            app.UseAuthorization();

//            app.MapControllers();

//            if (app.Environment.IsDevelopment())
//            {
//                app.UseSwagger();
//                app.UseSwaggerUI(c =>
//                {
//                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MapApp API V1");
//                    c.RoutePrefix = "swagger";
//                });
//            }

//            app.Run();
//        }
//    }
//}


