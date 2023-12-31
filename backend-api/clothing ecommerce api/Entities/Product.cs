using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class Product
{
    public int ProductId { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public int? Quantity { get; set; }

    public int? CategoryId { get; set; }

    public string? ImageUrl { get; set; }

    public decimal? Price { get; set; }

    public virtual ICollection<Cartitem> Cartitems { get; } = new List<Cartitem>();

    public virtual ICollection<Cart> Carts { get; } = new List<Cart>();

    public virtual Category? Category { get; set; }

    public virtual ICollection<Orderitem> Orderitems { get; } = new List<Orderitem>();
}
