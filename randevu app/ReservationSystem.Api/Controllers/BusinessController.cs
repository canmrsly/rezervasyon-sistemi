using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Infrastructure.Data;

namespace ReservationSystem.Api.Controllers
{
    [AllowAnonymous] // Müşteri tarafı herkese açık
    [ApiController]
    [Route("api/businesses")]
    public class BusinessesController : ControllerBase
    {
        private readonly IBusinessService _businessService;
        private readonly IReservationService _reservationService;
        private readonly IServiceService _serviceService;
        private readonly  AppDbContext _context;

        public BusinessesController(
            IBusinessService businessService,
            IReservationService reservationService,
            IServiceService serviceService,
            AppDbContext context)
        {
            _businessService = businessService;
            _reservationService = reservationService;
            _serviceService = serviceService;
            _context = context;
        }

        /// <summary>
        /// İşletme bilgisi (müşteri/misafir tarafı için).
        /// Örn: GET /api/businesses/1
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBusiness(int id)
        {
            var business = await _businessService.GetBusinessByIdAsync(id);
            if (business == null)
                return NotFound(new { message = "İşletme bulunamadı." });

            return Ok(new
            {
                business.Id,
                business.Name,
                business.Description,
                business.Address,
                business.Phone,
                business.Email
            });
        }

        /// <summary>
        /// Belirli bir tarih ve hizmet için uygun saatleri döner.
        /// Örn: GET /api/businesses/1/available-slots?serviceId=2&date=2025-11-22&staffId=5
        /// </summary>
        [HttpGet("{businessId:int}/available-slots")]
        public async Task<IActionResult> GetAvailableSlots(
            int businessId,
            [FromQuery] int serviceId,
            [FromQuery] DateTime date,
            [FromQuery] int? staffId)
        {
            try
            {
                // 1. Get Business & Service info to calculate all possible slots
                var business = await _businessService.GetBusinessByIdAsync(businessId);
                if (business == null)
                    return BadRequest(new { message = "Business not found." });

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId);

                if (service == null)
                    return BadRequest(new { message = "Service not found." });

                // 2. Get AVAILABLE slots from Service (handling staff logic)
                var availableSlots = await _reservationService.GetAvailableSlotsAsync(businessId, serviceId, date.Date, staffId);

                // 3. Generate ALL slots and mark availability
                var dayStart = date.Date.Add(business.WorkDayStart);
                var dayEnd = date.Date.Add(business.WorkDayEnd);

                var allSlots = new List<object>();
                var current = dayStart;

                while (current.AddMinutes(service.DurationMinutes) <= dayEnd)
                {
                    // Check if this slot is in the available list returned by service
                    bool isAvailable = availableSlots.Contains(current);

                    allSlots.Add(new
                    {
                        start = current,
                        formatted = current.ToString("yyyy-MM-dd HH:mm"),
                        isAvailable = isAvailable
                    });

                    current = current.AddMinutes(business.SlotDurationMinutes);
                }

                return Ok(allSlots);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// İlgili işletmenin servislerini listeler.
        /// Örn: GET /api/businesses/1/services
        /// </summary>
        [HttpGet("{businessId:int}/services")]
        public async Task<IActionResult> GetBusinessServices(int businessId)
        {
            var services = await _serviceService.GetServicesByBusinessAsync(businessId);

            var result = services.Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.DurationMinutes,
                s.Price
            });

            return Ok(result);
        }

        /// <summary>
        /// İşletmeye ait aktif personel listesini döner (müşteri tarafı için).
        /// GET /api/businesses/{businessId}/staff
        /// </summary>
        [HttpGet("{businessId:int}/staff")]
        public async Task<IActionResult> GetStaff(int businessId)
        {
            var staff = await _context.StaffMembers
                .Where(s => s.BusinessId == businessId && s.IsActive)
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Ok(staff);
        }
    }
}
