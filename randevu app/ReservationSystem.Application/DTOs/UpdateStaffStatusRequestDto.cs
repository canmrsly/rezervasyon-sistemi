namespace ReservationSystem.Application.DTOs
{
    public class UpdateStaffStatusRequestDto
    {
        public int StaffId { get; set; }
        public bool IsActive { get; set; }
    }
}
