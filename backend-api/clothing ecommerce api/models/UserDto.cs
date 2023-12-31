using System.ComponentModel.DataAnnotations;

namespace clothing_ecommerce_api.models
{
    public class UserDto
    {
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;

        public string? userRole { get; set; }

    }
}
