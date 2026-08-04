using Microsoft.EntityFrameworkCore;
using STS.Domain.Entities;

namespace STS.Infrastructure.Persistence;

public sealed class StsDbContext(DbContextOptions<StsDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<DayCapacity> DayCapacities => Set<DayCapacity>();
    public DbSet<Brief> Briefs => Set<Brief>();
    public DbSet<PackageQuote> PackageQuotes => Set<PackageQuote>();
    public DbSet<PackageAddOn> PackageAddOns => Set<PackageAddOn>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("User");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Lead>(entity =>
        {
            entity.ToTable("Lead");
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Booking");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.Date, x.Phone }).IsUnique();
        });

        modelBuilder.Entity<DayCapacity>(entity =>
        {
            entity.ToTable("DayCapacity");
            entity.HasKey(x => x.Date);
        });

        modelBuilder.Entity<Brief>(entity =>
        {
            entity.ToTable("Brief");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.LeadId).IsUnique();
        });

        modelBuilder.Entity<PackageQuote>(entity =>
        {
            entity.ToTable("PackageQuote");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.LeadId).IsUnique();
        });

        modelBuilder.Entity<PackageAddOn>(entity =>
        {
            entity.ToTable("PackageAddOn");
            entity.HasKey(x => x.Id);
        });
    }
}
