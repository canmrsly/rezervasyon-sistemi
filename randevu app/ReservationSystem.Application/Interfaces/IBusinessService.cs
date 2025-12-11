using System.Threading.Tasks;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Domain.Entities;

namespace ReservationSystem.Application.Interfaces
{
    public interface IBusinessService
    {
        Task<Business?> GetBusinessByIdAsync(int id);

        Task<bool> UpdateBusinessSettingsAsync(
            UpdateBusinessSettingsRequestDto request,
            int businessId // admin token’dan gelen
        );
    }

}
