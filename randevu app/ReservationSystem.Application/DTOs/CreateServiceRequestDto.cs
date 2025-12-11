using System.ComponentModel.DataAnnotations;

namespace ReservationSystem.Application.DTOs
{
    public class CreateServiceRequestDto
    {
        [Required(ErrorMessage = "Hizmet adı gereklidir")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Hizmet adı 2-100 karakter arası olmalıdır")]
        public string Name { get; set; } = null!;

        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Süre gereklidir")]
        [Range(5, 480, ErrorMessage = "Süre 5-480 dakika arasında olmalıdır")]
        public int DurationMinutes { get; set; } = 30;

        [Required(ErrorMessage = "Fiyat gereklidir")]
        [Range(0.01, 100000, ErrorMessage = "Fiyat 0.01-100000 TL arasında olmalıdır")]
        public decimal Price { get; set; }
    }

}
