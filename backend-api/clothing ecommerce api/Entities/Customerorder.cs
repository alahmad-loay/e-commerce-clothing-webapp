using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class Customerorder
{
    public int OrderId { get; set; }

    public int? CustomerId { get; set; }

    public DateTime? OrderDate { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<Cart> Carts { get; } = new List<Cart>();

    public virtual User? Customer { get; set; }

    public virtual ICollection<Orderitem> Orderitems { get; } = new List<Orderitem>();
}
