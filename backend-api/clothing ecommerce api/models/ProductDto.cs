using System.ComponentModel.DataAnnotations;

namespace clothing_ecommerce_api.Models
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        [MaxLength(150)]
        public string? Description { get; set; }

        public int? QuantityAvailable { get; set; }

        public int? CategoryId { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public string? ImageUrl { get; set; }
    }
}
