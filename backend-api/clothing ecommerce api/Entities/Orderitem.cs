using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class Orderitem
{
    public int OrderItemId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int? Quantity { get; set; }

    public virtual Customerorder? Order { get; set; }

    public virtual Product? Product { get; set; }
}
