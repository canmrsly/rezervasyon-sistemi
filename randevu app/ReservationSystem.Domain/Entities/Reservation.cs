using System;
using ReservationSystem.Domain.Enums;

namespace ReservationSystem.Domain.Entities
{
    public class Reservation
    {
        public int Id { get; set; }

        public int BusinessId { get; set; }
        public int ServiceId { get; set; }
        public int? StaffMemberId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Müşteri bilgileri
        public string CustomerName { get; set; } = null!;
        public string CustomerPhone { get; set; } = null!;

        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Business Business { get; set; } = null!;
        public Service Service { get; set; } = null!;
        public StaffMember? StaffMember { get; set; }
    }
}
