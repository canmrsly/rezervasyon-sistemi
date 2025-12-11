namespace ReservationSystem.Application.DTOs
{
    public class VerifyReservationRequestDto
    {
        public int ReservationId { get; set; }
        public string VerificationCode { get; set; } = null!;
    }
}
