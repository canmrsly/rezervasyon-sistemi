using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ReservationSystem.Application.DTOs;

namespace ReservationSystem.Application.Interfaces
{
    public interface IReservationService
    {
        Task<CreateReservationResultDto> CreateReservationAsync(CreateReservationRequestDto request);
        Task<IList<DateTime>> GetAvailableSlotsAsync(int businessId, int serviceId, DateTime date, int? staffId = null);

        Task<IList<ReservationListItemDto>> GetReservationsForDayAsync(int businessId, DateTime date);
        Task<bool> UpdateReservationStatusAsync(UpdateReservationStatusRequestDto request, int businessId);
    }
}
