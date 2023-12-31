namespace clothing_ecommerce_api.Models
{
    public class OrderItemDto
    {
        public int OrderId { get; set; }
        public int OrderItemId { get; set; }
        public int? ProductId { get; set; }
        public int? Quantity { get; set; }
        public int? CustomerId { get; set; }
        public string? Status { get; set; }
    }

    public class PlaceOrderDto
    {
        public List<OrderItemDto> OrderItems { get; set; }
    }
}
