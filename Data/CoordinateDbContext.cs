using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;

namespace staj.Data
{
    public class CoordinateDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public CoordinateDbContext(DbContextOptions<CoordinateDbContext> options) : base(options)
        {

        }


        public DbSet<Coordinate> Coordinates { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)

        //OnModelCreating = For example, I have a property named ID in class, but I want it to map to a column named user_id in the database.
        {
            modelBuilder.Entity<Coordinate>(builder =>
            {
                builder.ToTable("coordinates_geo");

                builder.Property(e => e.Id).HasColumnName("id").ValueGeneratedNever();

                builder.Property(e => e.Geo).HasColumnName("geo");

                builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(255);

            });
            //with the HasColumnName we match coordinates names with our db column names
        }

    }
}
