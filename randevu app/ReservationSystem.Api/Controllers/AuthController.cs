using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;

namespace ReservationSystem.Api.Controllers
{
    [AllowAnonymous] // Auth endpointleri olarak tamamen public
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Yeni bir işletme için admin kullanıcı oluşturur.
        /// Bu endpoint yalnızca initial setup içindir.
        /// </summary>
        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminRequestDto request)
        {
            try
            {
                await _authService.RegisterAdminAsync(request);
                return Ok(new { message = "Admin başarıyla oluşturuldu." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin kullanıcı giriş yapar ve JWT token alır.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var result = await _authService.LoginAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
