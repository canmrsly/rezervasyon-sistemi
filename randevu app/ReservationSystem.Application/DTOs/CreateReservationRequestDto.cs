using System;
using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.Application.DTOs
{
    public class CreateReservationRequestDto
    {
        [Required]
        public int BusinessId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        public int? StaffMemberId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        // Müşteri bilgileri
        [Required]
        [StringLength(200)]
        public string CustomerName { get; set; } = null!;

        [Required]
        [Phone]
        [StringLength(50)]
        public string CustomerPhone { get; set; } = null!;

        public string CaptchaToken { get; set; }
    }
}
