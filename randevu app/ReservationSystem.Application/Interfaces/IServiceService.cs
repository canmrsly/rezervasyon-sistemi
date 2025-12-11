using System.Collections.Generic;
using System.Threading.Tasks;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Application.DTOs; 

namespace ReservationSystem.Application.Interfaces
{
    public interface IServiceService
    {
        Task<Service?> GetServiceByIdAsync(int id, int businessId);
        Task<IList<Service>> GetServicesByBusinessAsync(int businessId);
        Task<Service> CreateServiceAsync(int businessId, CreateServiceRequestDto request);
        Task<bool> UpdateServiceAsync(UpdateServiceRequestDto request, int businessId);
        Task<bool> DeleteServiceAsync(int serviceId, int businessId);

    }
}
