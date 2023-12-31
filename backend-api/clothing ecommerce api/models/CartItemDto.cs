using clothing_ecommerce_api.Models;
using System.ComponentModel.DataAnnotations;

namespace clothing_ecommerce_api.models
{
    public class CartItemDto
    {
        [Required]
        public int CartItemId { get; set; }

        public int? CartId { get; set; }

        public int? ProductId { get; set; }

        public int? Quantity { get; set; }

        public ProductDto? Product { get; set; }
    }
}
