using System.Collections.Generic;

namespace ReservationSystem.Domain.Entities
{
    public class Service
    {
        public int Id { get; set; }

        public int BusinessId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public decimal? Price { get; set; }

        public Business Business { get; set; } = null!;
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
