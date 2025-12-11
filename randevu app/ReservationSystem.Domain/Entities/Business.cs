using System;
using System.Collections.Generic;

namespace ReservationSystem.Domain.Entities
{
    public class Business
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }

        // Çalışma saatleri (ileride saat slotu hesaplamak için kullanacağız)
        public TimeSpan WorkDayStart { get; set; } = new TimeSpan(9, 0, 0);
        public TimeSpan WorkDayEnd { get; set; } = new TimeSpan(18, 0, 0);
        public int SlotDurationMinutes { get; set; } = 30;
        public ICollection<User> Users { get; set; } = new List<User>();


        // Navigation collections
        public ICollection<Service> Services { get; set; } = new List<Service>();
        public ICollection<StaffMember> StaffMembers { get; set; } = new List<StaffMember>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
