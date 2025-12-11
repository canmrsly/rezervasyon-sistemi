using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Api.Helpers;

namespace ReservationSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/reservations")]
    public class AdminReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public AdminReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Giriş yapmış admin kullanıcının işletmesine ait,
        /// seçilen güne ait tüm rezervasyonları döner.
        /// Örn: GET /api/admin/reservations?date=2025-11-22
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetReservationsForDay(
            [FromQuery] DateTime date)
        {
            var businessId = User.GetBusinessId();

            var list = await _reservationService.GetReservationsForDayAsync(businessId, date);
            return Ok(list);
        }

        /// <summary>
        /// Rezervasyon durumunu günceller (Pending / Confirmed / Cancelled).
        /// Örn: PATCH /api/admin/reservations/status
        /// </summary>
        [HttpPatch("status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateReservationStatusRequestDto request)
        {
            try
            {
                var businessId = User.GetBusinessId(); // 🔥 token'dan alıyoruz

                var success = await _reservationService.UpdateReservationStatusAsync(request, businessId);
                if (!success)
                    return NotFound(new { message = "Rezervasyon bulunamadı." });

                return Ok(new { message = "Durum güncellendi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
