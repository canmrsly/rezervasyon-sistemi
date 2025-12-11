using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ReservationSystem.Application.DTOs;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Domain.Entities;
using ReservationSystem.Domain.Enums;
using ReservationSystem.Infrastructure.Data;
using System;
using System.Collections;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ReservationSystem.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Yeni admin kaydı
        public async Task<bool> RegisterAdminAsync(RegisterAdminRequestDto request)
        {
            // Email zaten var mı?
            var exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (exists)
                throw new Exception("Bu email adresi zaten kayıtlı.");

            // 1) Yeni işletme oluştur
            var business = new Business
            {
                Name = request.BusinessName,
                Description = null,
                Address = null,
                Email = request.Email, // isteğe bağlı
                Phone = null,
                WorkDayStart = new TimeSpan(9, 0, 0),
                WorkDayEnd = new TimeSpan(18, 0, 0),
                SlotDurationMinutes = 30,
            };

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            // 2) Parola hash oluştur
            CreatePasswordHash(request.Password, out byte[] hash, out byte[] salt);

            // 3) Yeni admin user oluştur
            var user = new User
            {
                BusinessId = business.Id, // 🔥 artık business buradan geliyor
                Email = request.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = UserRole.Admin,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return true;
        }


        // Login -> JWT üret
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Business)
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null)
                throw new Exception("Kullanıcı bulunamadı veya pasif.");

            if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
                throw new Exception("Şifre hatalı.");

            string token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Email = user.Email,
                BusinessId = user.BusinessId,
                BusinessName = user.Business?.Name,
                Role = user.Role.ToString()
            };
        }

        // Şifre hash
        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, byte[] hash, byte[] salt)
        {
            using var hmac = new HMACSHA512(salt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return StructuralComparisons.StructuralEqualityComparer.Equals(computed, hash);
        }

        // JWT oluştur
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"]
              ?? Environment.GetEnvironmentVariable("JWT_KEY")
              ?? throw new Exception("JWT key not found for token generation.");

            var key = Encoding.UTF8.GetBytes(jwtKey);


            var claims = new[]
            {
                new Claim("UserId", user.Id.ToString()),
                new Claim("BusinessId", user.BusinessId.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
