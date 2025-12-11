using System.Collections.Generic;

namespace ReservationSystem.Domain.Entities
{
    public class StaffMember
    {
        public int Id { get; set; }

        public int BusinessId { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; } = true;

        public Business Business { get; set; } = null!;
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
