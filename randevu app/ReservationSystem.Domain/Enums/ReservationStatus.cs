namespace ReservationSystem.Domain.Enums
{
    public enum ReservationStatus
    {
        Pending = 0,    // İşletme henüz onaylamadı
        Confirmed = 1,  // Onaylandı
        Cancelled = 2   // İptal edildi
    }
}
