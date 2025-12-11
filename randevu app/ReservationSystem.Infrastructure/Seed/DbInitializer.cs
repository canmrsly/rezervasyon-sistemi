using System;
using System.Linq;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Infrastructure.Data;

namespace ReservationSystem.Infrastructure.Seed
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // DB boşsa seed atalım
            if (!context.Businesses.Any())
            {
                var business = new Business
                {
                    Name = "Eren Kuaför",
                    Description = "Örnek işledddtme - Demo amaçlı",
                    Address = "Sakarya / Merkez",
                    Phone = "0555 000 00 10",
                    Email = "demo@kuafor.com",
                    WorkDayStart = new TimeSpan(9, 0, 0),
                    WorkDayEnd = new TimeSpan(18, 0, 0),
                    SlotDurationMinutes = 30
                };

                context.Businesses.Add(business);
                context.SaveChanges();

                var serviceHaircut = new Service
                {
                    BusinessId = business.Id,
                    Name = "Saç Kesimi",
                    DurationMinutes = 30,
                    Price = 200
                };

                var serviceBeard = new Service
                {
                    BusinessId = business.Id,
                    Name = "Sakal Tıraşı",
                    DurationMinutes = 20,
                    Price = 150
                };

                context.Services.AddRange(serviceHaircut, serviceBeard);
                context.SaveChanges();

                // İsteğe bağlı: 1 tane örnek rezervasyon da atalım
                var demoReservation = new Reservation
                {
                    BusinessId = business.Id,
                    ServiceId = serviceHaircut.Id,
                    StaffMemberId = null,
                    StartTime = DateTime.Today.AddHours(11),       // bugün 11:00
                    EndTime = DateTime.Today.AddHours(11.5),      // 11:30
                    CustomerName = "Örnek Müşteri",
                    CustomerPhone = "05551112233",
                    Status = Domain.Enums.ReservationStatus.Confirmed,
                    CreatedAt = DateTime.UtcNow
                };

                context.Reservations.Add(demoReservation);
                context.SaveChanges();
            }
        }
    }
}
