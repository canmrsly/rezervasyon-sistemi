using System.Collections.Generic;
using System.Threading.Tasks;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Domain.Entities;

namespace ReservationSystem.Application.Interfaces
{
    public interface IStaffService
    {
        Task<IList<StaffMember>> GetStaffByBusinessAsync(int businessId);
        Task<StaffMember> CreateStaffAsync(int businessId, CreateStaffRequestDto request);
        Task<bool> UpdateStaffStatusAsync(UpdateStaffStatusRequestDto request, int businessId);
        Task<bool> DeleteStaffAsync(int staffId, int businessId);
    }
}
