using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.Application.DTOs
{
    public class RegisterAdminRequestDto
    {
        [Required]
        [StringLength(100)]
        public string BusinessName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
