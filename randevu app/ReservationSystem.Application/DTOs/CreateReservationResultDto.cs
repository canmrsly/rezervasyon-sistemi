using System;

namespace ReservationSystem.Application.DTOs
{
    public class CreateReservationResultDto
    {
        public int ReservationId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public bool IsVerificationRequired { get; set; }
        public string? MaskedDestination { get; set; }
        public string Status { get; set; } = null!;

        // Sadece geliştirme sırasında kullanacağımız alan:
        public string? DebugVerificationCode { get; set; }
    }
}
