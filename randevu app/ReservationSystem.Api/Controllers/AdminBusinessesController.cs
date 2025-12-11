using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Api.Helpers;

namespace ReservationSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/business")]
    public class AdminBusinessesController : ControllerBase
    {
        private readonly IBusinessService _businessService;

        public AdminBusinessesController(IBusinessService businessService)
        {
            _businessService = businessService;
        }

        /// <summary>
        /// Admin kullanıcısının kendi işletme detaylarını döner.
        /// GET /api/admin/business
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyBusiness()
        {
            var businessId = User.GetBusinessId();

            var business = await _businessService.GetBusinessByIdAsync(businessId);
            if (business == null)
                return NotFound(new { message = "İşletme bulunamadı." });

            return Ok(new
            {
                business.Id,
                business.Name,
                business.Description,
                business.Address,
                business.Phone,
                business.Email,
                business.WorkDayStart,
                business.WorkDayEnd,
                business.SlotDurationMinutes
            });
        }

        /// <summary>
        /// Admin kendi işletme ayarlarını günceller.
        /// PATCH /api/admin/business
        /// </summary>
        [HttpPatch]
        public async Task<IActionResult> UpdateBusiness([FromBody] UpdateBusinessSettingsRequestDto request)
        {
            var businessId = User.GetBusinessId(); // token’dan gelen

            var success = await _businessService.UpdateBusinessSettingsAsync(request, businessId);

            if (!success)
                return NotFound(new { message = "İşletme bulunamadı." });

            return Ok(new { message = "İşletme ayarları güncellendi." });
        }

    }
}
