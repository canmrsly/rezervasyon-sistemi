using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Api.Helpers;

namespace ReservationSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/services")]
    public class AdminServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public AdminServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        /// <summary>
        /// Admin kullanıcının kendi işletmesi için yeni hizmet oluşturur.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceRequestDto request)
        {
            try
            {
                var businessId = User.GetBusinessId(); // token’dan geliyor

                var service = await _serviceService.CreateServiceAsync(businessId, request);

                return Ok(new
                {
                    service.Id,
                    service.BusinessId,
                    service.Name,
                    service.DurationMinutes,
                    service.Price
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Admin sadece kendi işletmesine ait hizmeti güncelleyebilir.
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateService([FromBody] UpdateServiceRequestDto request)
        {
            try
            {
                var businessId = User.GetBusinessId(); // token'dan alıyoruz

                var success = await _serviceService.UpdateServiceAsync(request, businessId);
                if (!success)
                    return NotFound(new { message = "Hizmet bulunamadı veya güncellenemedi." });

                return Ok(new { message = "Hizmet güncellendi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Admin sadece kendi işletmesine ait hizmeti silebilir.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var businessId = User.GetBusinessId();

                var success = await _serviceService.DeleteServiceAsync(id, businessId);
                if (!success)
                    return NotFound(new { message = "Hizmet bulunamadı veya silinemez." });

                return Ok(new { message = "Hizmet silindi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
