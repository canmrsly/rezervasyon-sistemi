using System;

namespace ReservationSystem.Application.DTOs
{
    public class ReservationListItemDto
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public int ServiceId { get; set; }
        public int? StaffMemberId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public string CustomerName { get; set; } = null!;
        public string CustomerPhone { get; set; } = null!;

        public string ServiceName { get; set; } = null!;
        public string? StaffMemberName { get; set; }

        public string Status { get; set; } = null!;   // Pending / Confirmed / Cancelled
    }
}
