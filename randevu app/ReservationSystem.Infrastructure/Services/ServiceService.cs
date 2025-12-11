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
    public class ServiceService : IServiceService
    {
        private readonly AppDbContext _context;

        public ServiceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Service?> GetServiceByIdAsync(int id, int businessId)
        {
            return await _context.Services
                .Include(s => s.Business)
                .FirstOrDefaultAsync(s =>
                    s.Id == id &&
                    s.BusinessId == businessId);
        }

        public async Task<IList<Service>> GetServicesByBusinessAsync(int businessId)
        {
            return await _context.Services
                .Where(s => s.BusinessId == businessId)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Service> CreateServiceAsync(int businessId, CreateServiceRequestDto request)
        {
            // İlgili işletme var mı?
            var businessExists = await _context.Businesses
                .AnyAsync(b => b.Id == businessId);

            if (!businessExists)
                throw new System.Exception("İşletme bulunamadı.");

            var service = new Service
            {
                BusinessId = businessId,
                Name = request.Name,
                Description = request.Description,
                DurationMinutes = request.DurationMinutes,
                Price = request.Price
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return service;
        }


        public async Task<bool> UpdateServiceAsync(UpdateServiceRequestDto request, int businessId)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s =>
                    s.Id == request.Id &&
                    s.BusinessId == businessId);

            if (service == null)
                return false;

            service.Name = request.Name;
            service.Description = request.Description;
            service.DurationMinutes = request.DurationMinutes;
            service.Price = request.Price;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(int serviceId, int businessId)
        {
            var service = await _context.Services
                .Include(s => s.Reservations)
                .FirstOrDefaultAsync(s =>
                    s.Id == serviceId &&
                    s.BusinessId == businessId);

            if (service == null)
                return false;

            if (service.Reservations.Any())
                throw new System.Exception("Bu hizmete bağlı rezervasyonlar var. Önce rezervasyonları iptal etmelisiniz.");

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
