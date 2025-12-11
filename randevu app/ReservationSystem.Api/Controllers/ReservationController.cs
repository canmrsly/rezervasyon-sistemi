using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;

namespace ReservationSystem.Api.Controllers
{
    [AllowAnonymous] // Müşteri tarafı public
    [ApiController]
    [Route("api/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Müşteri tarafından yeni rezervasyon oluşturur.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequestDto request)
        {
            try
            {
                var result = await _reservationService.CreateReservationAsync(request);
                return Ok(result); // { reservationId, verificationRequired, ... }
            }
            catch (Exception ex)
            {
                // Üretimde detay verilmez → sadece message
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
