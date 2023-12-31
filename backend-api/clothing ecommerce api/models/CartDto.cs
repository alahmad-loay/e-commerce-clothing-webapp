using System.ComponentModel.DataAnnotations;

namespace clothing_ecommerce_api.models
{
    public class CartDto
    {
        [Required]
        public int CartId { get; set; }

        [Required]
        public int UserId { get; set; }

        public int? OrderId { get; set; }

        public List<CartItemDto>? Items { get; set; }

    }
}
