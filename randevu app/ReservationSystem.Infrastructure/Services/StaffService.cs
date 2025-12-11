using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Infrastructure.Data;

namespace ReservationSystem.Infrastructure.Services
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;

        public StaffService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IList<StaffMember>> GetStaffByBusinessAsync(int businessId)
        {
            return await _context.StaffMembers
                                 .Where(s => s.BusinessId == businessId)
                                 .OrderByDescending(s => s.IsActive)
                                 .ThenBy(s => s.Name)
                                 .ToListAsync();
        }

        public async Task<StaffMember> CreateStaffAsync(int businessId, CreateStaffRequestDto request)
        {
            var businessExists = await _context.Businesses
                .AnyAsync(b => b.Id == businessId);

            if (!businessExists)
                throw new System.Exception("İşletme bulunamadı.");

            var staff = new StaffMember
            {
                BusinessId = businessId,  // 🔥 Artık buradan geliyor
                Name = request.Name,
                IsActive = true
            };

            _context.StaffMembers.Add(staff);
            await _context.SaveChangesAsync();

            return staff;
        }


        public async Task<bool> UpdateStaffStatusAsync(UpdateStaffStatusRequestDto request, int businessId)
        {
            var staff = await _context.StaffMembers
                                      .FirstOrDefaultAsync(s =>
                                          s.Id == request.StaffId &&
                                          s.BusinessId == businessId);

            if (staff == null)
                return false;

            staff.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStaffAsync(int staffId, int businessId)
        {
            var staff = await _context.StaffMembers
                                      .Include(s => s.Reservations)
                                      .FirstOrDefaultAsync(s =>
                                          s.Id == staffId &&
                                          s.BusinessId == businessId);

            if (staff == null)
                return false;

            // Bu personele bağlı rezervasyon varsa silmek sıkıntılı olabilir.
            // Şimdilik basit kural: rezervasyon varsa hata fırlat.
            if (staff.Reservations.Any())
                throw new System.Exception("Bu personele bağlı rezervasyonlar var. Önce rezervasyonları güncellemelisiniz.");

            _context.StaffMembers.Remove(staff);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
