using Microsoft.EntityFrameworkCore;
using ReservationSystem.Domain.Entities;

namespace ReservationSystem.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Business> Businesses => Set<Business>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<StaffMember> StaffMembers => Set<StaffMember>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<User> Users => Set<User>();



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Business
            modelBuilder.Entity<Business>(entity =>
            {
                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(200);
            });

            // Service
            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.HasOne(s => s.Business)
                      .WithMany(b => b.Services)
                      .HasForeignKey(s => s.BusinessId)
                      .OnDelete(DeleteBehavior.Cascade); // bu kalabilir
            });
              modelBuilder.Entity<User>()
              .HasOne(u => u.Business)
              .WithMany(b => b.Users)
              .HasForeignKey(u => u.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);


            // StaffMember
            modelBuilder.Entity<StaffMember>(entity =>
            {
                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.HasOne(s => s.Business)
                      .WithMany(b => b.StaffMembers)
                      .HasForeignKey(s => s.BusinessId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Reservation
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.Property(r => r.CustomerName)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(r => r.CustomerPhone)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.HasOne(r => r.Business)
                      .WithMany(b => b.Reservations)
                      .HasForeignKey(r => r.BusinessId)
                      .OnDelete(DeleteBehavior.Restrict);   // 👈 ÖNEMLİ

                entity.HasOne(r => r.Service)
                      .WithMany(s => s.Reservations)
                      .HasForeignKey(r => r.ServiceId)
                      .OnDelete(DeleteBehavior.Restrict);   // 👈 ÖNEMLİ

                entity.HasOne(r => r.StaffMember)
                      .WithMany(s => s.Reservations)
                      .HasForeignKey(r => r.StaffMemberId)
                      .OnDelete(DeleteBehavior.Restrict);   // zaten vardı
            });
        }
    }
}
