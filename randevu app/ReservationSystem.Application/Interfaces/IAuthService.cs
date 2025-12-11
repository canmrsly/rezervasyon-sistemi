using System.Threading.Tasks;
using ReservationSystem.Application.DTOs;

namespace ReservationSystem.Application.Interfaces
{
    public interface IAuthService
    {
        /// <summary>
        /// Yeni bir admin kullanıcı kaydeder (mevcut bir BusinessId için).
        /// </summary>
        Task<bool> RegisterAdminAsync(RegisterAdminRequestDto request);

        /// <summary>
        /// Kullanıcıyı email & şifre ile doğrular ve JWT token üretir.
        /// </summary>
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}
