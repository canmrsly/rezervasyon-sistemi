using System;
using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.Application.DTOs
{
    public class UpdateBusinessSettingsRequestDto
    {
        [StringLength(200)]
        public string? Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [Phone]
        [StringLength(50)]
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public TimeSpan? WorkDayStart { get; set; }
        public TimeSpan? WorkDayEnd { get; set; }

        [Range(5, 480)]
        public int? SlotDurationMinutes { get; set; }
    }
}
