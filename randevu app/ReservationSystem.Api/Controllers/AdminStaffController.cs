using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Api.Helpers;
using System.Linq;

namespace ReservationSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/staff")]
    public class AdminStaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public AdminStaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        /// <summary>
        /// Giriş yapmış admin kullanıcının işletmesine ait tüm personel listesini döner.
        /// Örn: GET /api/admin/staff
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStaff()
        {
            var businessId = User.GetBusinessId();

            var staff = await _staffService.GetStaffByBusinessAsync(businessId);

            var result = staff.Select(s => new
            {
                s.Id,
                s.BusinessId,
                s.Name,
                s.IsActive
            });

            return Ok(result);
        }

        /// <summary>
        /// Admin kullanıcının kendi işletmesine yeni personel ekler.
        /// Örn: POST /api/admin/staff
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequestDto request)
        {
            try
            {
                var businessId = User.GetBusinessId(); // token'dan geliyor

                var staff = await _staffService.CreateStaffAsync(businessId, request);

                return Ok(new
                {
                    staff.Id,
                    staff.BusinessId,
                    staff.Name,
                    staff.IsActive
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        /// <summary>
        /// Personelin aktif/pasif durumunu günceller.
        /// Örn: PATCH /api/admin/staff/status
        /// </summary>
        [HttpPatch("status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStaffStatusRequestDto request)
        {
            try
            {
                var businessId = User.GetBusinessId();

                var success = await _staffService.UpdateStaffStatusAsync(request, businessId);
                if (!success)
                    return NotFound(new { message = "Personel bulunamadı." });

                return Ok(new { message = "Personel durumu güncellendi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Personeli siler (bağlı rezervasyon yoksa ve aynı işletmeye aitse).
        /// Örn: DELETE /api/admin/staff/5
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var businessId = User.GetBusinessId();

                var success = await _staffService.DeleteStaffAsync(id, businessId);
                if (!success)
                    return NotFound(new { message = "Personel bulunamadı." });

                return Ok(new { message = "Personel silindi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
