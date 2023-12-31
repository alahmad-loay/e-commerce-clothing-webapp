using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class Cart
{
    public int CartId { get; set; }

    public int? UserId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int? Quantity { get; set; }

    public virtual ICollection<Cartitem> Cartitems { get; } = new List<Cartitem>();

    public virtual Customerorder? Order { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }
}
