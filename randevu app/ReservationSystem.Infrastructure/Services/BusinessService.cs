using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Infrastructure.Data;

namespace ReservationSystem.Infrastructure.Services
{
    public class BusinessService : IBusinessService
    {
        private readonly AppDbContext _context;

        public BusinessService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Business?> GetBusinessByIdAsync(int id)
        {
            return await _context.Businesses
                .Include(b => b.Services)
                .Include(b => b.StaffMembers)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        /// <summary>
        /// Admin kendi işletmesinin ayarlarını günceller.
        /// Dışarıdan ID alınmaz; businessId token'dan gelir.
        /// </summary>
        public async Task<bool> UpdateBusinessSettingsAsync(UpdateBusinessSettingsRequestDto request, int businessId)
        {
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId);

            if (business == null)
                return false;

            if (!string.IsNullOrWhiteSpace(request.Name))
                business.Name = request.Name;

            if (request.Description != null)
                business.Description = request.Description;

            if (request.Address != null)
                business.Address = request.Address;

            if (request.Phone != null)
                business.Phone = request.Phone;

            if (request.Email != null)
                business.Email = request.Email;

            if (request.WorkDayStart.HasValue)
                business.WorkDayStart = request.WorkDayStart.Value;

            if (request.WorkDayEnd.HasValue)
                business.WorkDayEnd = request.WorkDayEnd.Value;

            if (request.SlotDurationMinutes.HasValue && request.SlotDurationMinutes.Value > 0)
                business.SlotDurationMinutes = request.SlotDurationMinutes.Value;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
