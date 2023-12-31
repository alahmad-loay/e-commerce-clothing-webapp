using clothing_ecommerce_api.Entities;
using clothing_ecommerce_api.models;
using clothing_ecommerce_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace clothing_ecommerce_api.Controllers
{
    [Route("api/cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ClothesStoreContext _context;

        public CartController(ClothesStoreContext clothesStoreContext)
        {
            _context = clothesStoreContext;
        }

        [HttpPost("user/{userId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> AddToCart(int userId, CartItemDto cartItemDto)
        {
            var user = await _context.Users
                .Include(u => u.Carts)
                .ThenInclude(c => c.Cartitems)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound();
            }

            var cart = user.Carts.FirstOrDefault();
            if (cart == null)
            {
                return BadRequest();
            }

            var existingCartItem = cart.Cartitems.FirstOrDefault(ci => ci.ProductId == cartItemDto.ProductId);
            if (existingCartItem != null)
            {
                var updatedQuantity = existingCartItem.Quantity + cartItemDto.Quantity;

                var product = await _context.Products.FindAsync(cartItemDto.ProductId);
                if (product == null)
                {
                    return NotFound();
                }

                if (updatedQuantity > product.Quantity)
                {
                    return BadRequest();
                }

                existingCartItem.Quantity = updatedQuantity;
            }
            else
            {
                var product = await _context.Products.FindAsync(cartItemDto.ProductId);
                if (product == null)
                {
                    return NotFound();
                }

                if (cartItemDto.Quantity > product.Quantity)
                {
                    return BadRequest();
                }

                var cartItem = new Cartitem
                {
                    CartId = cart.CartId,
                    ProductId = cartItemDto.ProductId,
                    Quantity = cartItemDto.Quantity
                };

                _context.Cartitems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }


        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<List<CartItemDto>>> GetCartItems(int userId)
        {
            var user = await _context.Users.Include(u => u.Carts)
                                           .ThenInclude(c => c.Cartitems)
                                           .ThenInclude(ci => ci.Product) 
                                           .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound();
            }

            var cart = user.Carts.FirstOrDefault();
            if (cart == null)
            {
                return NotFound();
            }

            var cartItems = cart.Cartitems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                CartId = ci.CartId,
                ProductId = ci.ProductId,
                Quantity = ci.Quantity,
                Product = new ProductDto
                {
                    ProductId = ci.Product.ProductId,
                    Name = ci.Product.Name,
                    Description = ci.Product.Description,
                    QuantityAvailable = ci.Product.Quantity ?? 0,
                    CategoryId = ci.Product.CategoryId ?? 0
                }
            }).ToList();

            return cartItems;
        }



        [HttpDelete("{cartItemId}/user/{userId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> RemoveFromCart(int userId, int cartItemId)
        {
            var user = await _context.Users.Include(u => u.Carts)
                                           .ThenInclude(c => c.Cartitems)
                                           .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound();
            }

            var cart = user.Carts.FirstOrDefault();
            if (cart == null)
            {
                return NotFound();
            }

            var cartItem = cart.Cartitems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
            if (cartItem == null)
            {
                return NotFound();
            }

            _context.Cartitems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
