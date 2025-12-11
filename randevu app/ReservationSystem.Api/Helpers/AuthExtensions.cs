using System.Security.Claims;

namespace ReservationSystem.Api.Helpers
{
    public static class AuthExtensions
    {
        public static int GetBusinessId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("BusinessId")?.Value;
            return int.Parse(value!);
        }

        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("UserId")?.Value;
            return int.Parse(value!);
        }
    }
}
