namespace ReservationSystem.Application.DTOs
{
    public class VerifyReservationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? Status { get; set; }   // Confirmed / Pending / etc.
    }
}
