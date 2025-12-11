namespace ReservationSystem.Application.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int BusinessId { get; set; }
        public string Role { get; set; } = null!;
        public string? BusinessName { get; set; }
    }
}
