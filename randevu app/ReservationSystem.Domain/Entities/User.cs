using System;
using ReservationSystem.Domain.Enums;

namespace ReservationSystem.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        // Hangi işletmeye ait?
        public int BusinessId { get; set; }
        public Business Business { get; set; } = null!;

        // Giriş bilgileri
        public string Email { get; set; } = null!;
        public byte[] PasswordHash { get; set; } = null!;
        public byte[] PasswordSalt { get; set; } = null!;

        public UserRole Role { get; set; } = UserRole.Admin;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
