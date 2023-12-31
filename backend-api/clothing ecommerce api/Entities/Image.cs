using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class Image
{
    public int ImageId { get; set; }

    public int? ProductId { get; set; }

    public string? ImageUrl { get; set; }

    public virtual Product? Product { get; set; }
}
