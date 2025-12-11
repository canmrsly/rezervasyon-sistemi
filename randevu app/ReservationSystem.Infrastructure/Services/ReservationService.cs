using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Domain.Enums;
using ReservationSystem.Infrastructure.Data;

namespace ReservationSystem.Infrastructure.Services
{
    public class ReservationService : IReservationService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _captchaSecretKey;

        public ReservationService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _captchaSecretKey = configuration["Captcha:SecretKey"] 
                ?? throw new Exception("Captcha secret key is not configured. Please set Captcha:SecretKey.");
        }

        private async Task<bool> VerifyCaptchaAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            var response = await _httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={_captchaSecretKey}&response={token}", null);
            if (!response.IsSuccessStatusCode)
                return false;

            var jsonString = await response.Content.ReadAsStringAsync();

            try
            {
                var verification = JsonSerializer.Deserialize<RecaptchaVerifyResponse>(jsonString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (verification == null || !verification.Success)
                    return false;

                if (verification.Score.HasValue && verification.Score.Value < 0.5m)
                    return false;

                return true;
            }
            catch (JsonException)
            {
                return false;
            }
        }

        // ================================
        // CREATE RESERVATION
        // ================================
        public async Task<CreateReservationResultDto> CreateReservationAsync(CreateReservationRequestDto request)
        {
            // 0. Verify Captcha
            if (!await VerifyCaptchaAsync(request.CaptchaToken))
            {
                throw new Exception("Robot doğrulaması başarısız oldu. Lütfen tekrar deneyin.");
            }

            var business = await _context.Businesses.FindAsync(request.BusinessId);
            if (business == null)
                throw new Exception("Business not found.");

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.BusinessId == request.BusinessId);

            if (service == null)
                throw new Exception("Service not found.");

            // Personel işletmeye ait mi? (Multi-tenant güvenlik)
            if (request.StaffMemberId.HasValue)
            {
                var staff = await _context.StaffMembers
                    .FirstOrDefaultAsync(s =>
                        s.Id == request.StaffMemberId &&
                        s.BusinessId == request.BusinessId);

                if (staff == null)
                    throw new Exception("Personel bu işletmeye ait değil.");
            }

            var startTime = request.StartTime;
            var endTime = startTime.AddMinutes(service.DurationMinutes);

            // 1. Get all active staff count
            var totalStaffCount = await _context.StaffMembers
                .CountAsync(s => s.BusinessId == request.BusinessId && s.IsActive);

            if (totalStaffCount == 0)
                throw new Exception("İşletmede aktif personel bulunmuyor.");

            // 2. Get existing reservations for this time slot
            var existingReservations = await _context.Reservations
                .Where(r =>
                    r.BusinessId == request.BusinessId &&
                    r.Status != ReservationStatus.Cancelled &&
                    (
                        (startTime >= r.StartTime && startTime < r.EndTime) ||
                        (endTime > r.StartTime && endTime <= r.EndTime) ||
                        (startTime <= r.StartTime && endTime >= r.EndTime)
                    ))
                .ToListAsync();

            // 3. Analyze capacity
            var specificReservationsCount = existingReservations.Count(r => r.StaffMemberId.HasValue);
            var floatingReservationsCount = existingReservations.Count(r => !r.StaffMemberId.HasValue);
            var busyStaffIds = existingReservations
                .Where(r => r.StaffMemberId.HasValue)
                .Select(r => r.StaffMemberId.Value)
                .ToHashSet();

            // Find all staff IDs
            var allStaffIds = await _context.StaffMembers
                .Where(s => s.BusinessId == request.BusinessId && s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();

            // Identify staff who are NOT specifically busy
            var freeStaffIds = allStaffIds.Except(busyStaffIds).ToList();

            // Calculate truly available slots (accounting for floating reservations)
            // Floating reservations occupy 'some' free staff, so we subtract them
            var trulyAvailableSlots = freeStaffIds.Count - floatingReservationsCount;

            if (trulyAvailableSlots <= 0)
                throw new Exception("Seçtiğiniz saatte tüm personel dolu.");

            int? assignedStaffId = request.StaffMemberId;

            if (assignedStaffId.HasValue)
            {
                // Case A: Specific Staff Selected
                if (busyStaffIds.Contains(assignedStaffId.Value))
                    throw new Exception("Seçtiğiniz personel bu saatte dolu.");

                // We already checked trulyAvailableSlots > 0, which implies global capacity is OK.
                // But we need to ensure that taking THIS specific staff doesn't starve floating reservations.
                // If we take this staff, FreeStaffIds reduces by 1.
                // We need (FreeStaffIds.Count - 1) >= FloatingCount.
                // This is exactly what trulyAvailableSlots > 0 checks! 
                // (FreeCount - Floating > 0) => (FreeCount - 1 >= Floating).
                // So no extra check needed? 
                // Wait. If I pick a staff that is in FreeStaffIds, yes.
                // But assignedStaffId MUST be in FreeStaffIds because we checked busyStaffIds.Contains.
                // So yes, the check covers it.
            }
            else
            {
                // Case B: "Any" Staff Selected -> Assign Random Available Staff
                // Pick a random staff from FreeStaffIds
                // We can pick ANY free staff, because floating reservations can shift to others.
                var random = new Random();
                assignedStaffId = freeStaffIds[random.Next(freeStaffIds.Count)];
            }

            var reservation = new Reservation
            {
                BusinessId = request.BusinessId,
                ServiceId = request.ServiceId,
                StaffMemberId = assignedStaffId,
                StartTime = startTime,
                EndTime = endTime,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                Status = ReservationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return new CreateReservationResultDto
            {
                ReservationId = reservation.Id,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                IsVerificationRequired = false,
                MaskedDestination = MaskPhone(request.CustomerPhone),
                Status = reservation.Status.ToString(),
                DebugVerificationCode = null
            };
        }

        // ================================
        // AVAILABLE SLOTS
        // ================================
        public async Task<IList<DateTime>> GetAvailableSlotsAsync(int businessId, int serviceId, DateTime date, int? staffId = null)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new Exception("Business not found.");

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId);

            if (service == null)
                throw new Exception("Service not found.");

            // Get all active staff members for this business
            var allStaff = await _context.StaffMembers
                .Where(s => s.BusinessId == businessId && s.IsActive)
                .ToListAsync();

            if (!allStaff.Any())
                throw new Exception("No active staff found for this business.");

            var dayStart = date.Date + business.WorkDayStart;
            var dayEnd = date.Date + business.WorkDayEnd;

            // Get all reservations for the day
            var reservations = await _context.Reservations
                .Where(r => r.BusinessId == businessId &&
                            r.StartTime.Date == date.Date &&
                            r.Status != ReservationStatus.Cancelled)
                .ToListAsync();

            var slots = new List<DateTime>();

            var current = dayStart;
            while (current.AddMinutes(service.DurationMinutes) <= dayEnd)
            {
                var slotEnd = current.AddMinutes(service.DurationMinutes);

                // Find staff members who are BUSY at this slot (Specific Reservations)
                var busyStaffIds = reservations
                    .Where(r =>
                        r.StaffMemberId.HasValue &&
                        ((current >= r.StartTime && current < r.EndTime) ||
                        (slotEnd > r.StartTime && slotEnd <= r.EndTime) ||
                        (current <= r.StartTime && slotEnd >= r.EndTime))
                    )
                    .Select(r => r.StaffMemberId.Value)
                    .Distinct()
                    .ToHashSet();

                // Count Floating Reservations at this slot
                var floatingReservationsCount = reservations
                    .Count(r =>
                        !r.StaffMemberId.HasValue &&
                        ((current >= r.StartTime && current < r.EndTime) ||
                        (slotEnd > r.StartTime && slotEnd <= r.EndTime) ||
                        (current <= r.StartTime && slotEnd >= r.EndTime))
                    );

                bool isSlotAvailable;
                var totalStaffCount = allStaff.Count;
                var specificReservationsCount = busyStaffIds.Count;

                if (staffId.HasValue)
                {
                    // Specific staff selected
                    // 1. Is this staff specifically busy?
                    if (busyStaffIds.Contains(staffId.Value))
                    {
                        isSlotAvailable = false;
                    }
                    else
                    {
                        // 2. Is there room for floating reservations if we take this staff?
                        // Remaining capacity = Total - Specific - 1 (for us)
                        // We need: Floating <= Remaining
                        var remainingCapacity = totalStaffCount - specificReservationsCount - 1;
                        isSlotAvailable = floatingReservationsCount <= remainingCapacity;
                    }
                    
                    // Security check
                    if (isSlotAvailable && !allStaff.Any(s => s.Id == staffId.Value))
                        isSlotAvailable = false;
                }
                else
                {
                    // "Any" staff selected (Floating)
                    // We need: (Floating + 1) <= (Total - Specific)
                    var currentCapacity = totalStaffCount - specificReservationsCount;
                    isSlotAvailable = (floatingReservationsCount + 1) <= currentCapacity;
                }

                if (isSlotAvailable)
                    slots.Add(current);

                current = current.AddMinutes(business.SlotDurationMinutes);
            }

            return slots;
        }

        // ================================
        // ADMIN: GET DAILY RESERVATIONS
        // ================================
        public async Task<IList<ReservationListItemDto>> GetReservationsForDayAsync(int businessId, DateTime date)
        {
            var start = date.Date;
            var end = start.AddDays(1);

            var reservations = await _context.Reservations
                .Include(r => r.Service)
                .Include(r => r.StaffMember)
                .Where(r => r.BusinessId == businessId &&
                            r.StartTime >= start &&
                            r.StartTime < end)
                .OrderBy(r => r.StartTime)
                .ToListAsync();

            return reservations.Select(r => new ReservationListItemDto
            {
                Id = r.Id,
                BusinessId = r.BusinessId,
                ServiceId = r.ServiceId,
                StaffMemberId = r.StaffMemberId,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                CustomerName = r.CustomerName,
                CustomerPhone = r.CustomerPhone,
                ServiceName = r.Service.Name,
                StaffMemberName = r.StaffMember?.Name,
                Status = r.Status.ToString()
            }).ToList();
        }

        // ================================
        // ADMIN: UPDATE STATUS (SECURE)
        // ================================
        public async Task<bool> UpdateReservationStatusAsync(UpdateReservationStatusRequestDto request, int businessId)
        {
            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r =>
                    r.Id == request.ReservationId &&
                    r.BusinessId == businessId);

            if (reservation == null)
                return false;

            var newStatus = request.Status;

            reservation.Status = newStatus;

            await _context.SaveChangesAsync();
            return true;
        }


        // ================================
        // HELPERS
        // ================================
        private string MaskPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone) || phone.Length < 4)
                return "***";

            return $"*** *** ** {phone[^2..]}";
        }

        private sealed class RecaptchaVerifyResponse
        {
            public bool Success { get; set; }
            public decimal? Score { get; set; }
            public string Hostname { get; set; }
            public string Action { get; set; }
            public string Challenge_TS { get; set; }
            public IEnumerable<string> Error_Codes { get; set; }
        }
    }
}
