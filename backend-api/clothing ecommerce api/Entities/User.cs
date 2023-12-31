using System;
using System.Collections.Generic;

namespace clothing_ecommerce_api.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string? Email { get; set; }

    public string? UserRole { get; set; }

    public byte[] PasswordHash { get; set; } = null!;

    public byte[] PasswordSalt { get; set; } = null!;

    public virtual ICollection<Cart> Carts { get; } = new List<Cart>();

    public virtual ICollection<Customerorder> Customerorders { get; } = new List<Customerorder>();
}
