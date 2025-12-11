using ReservationSystem.Domain.Enums;

namespace ReservationSystem.Application.DTOs
{
    public class UpdateReservationStatusRequestDto
    {
        public int ReservationId { get; set; }
        public ReservationStatus Status { get; set; }

    }
}
