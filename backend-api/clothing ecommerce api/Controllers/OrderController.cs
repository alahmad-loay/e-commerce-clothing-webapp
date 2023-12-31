using clothing_ecommerce_api.Entities;
using clothing_ecommerce_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace clothing_ecommerce_api.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly ClothesStoreContext _context;

        public OrderController(ClothesStoreContext context)
        {
            _context = context;
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<OrderItemDto>>> GetAllOrders()
        {
            var orders = await _context.Customerorders
                .Include(o => o.Orderitems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();

            var orderItems = orders.SelectMany(o => o.Orderitems)
                .Select(oi => new OrderItemDto
                {
                    OrderId = (int)oi.OrderId,
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    CustomerId = oi.Order.CustomerId ,
                    Status = oi.Order.Status
                })
                .ToList();

            return Ok(orderItems);
        }




        [HttpPost("{userId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> PlaceOrder(int userId)
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
            if (cart == null || !cart.Cartitems.Any())
            {
                return BadRequest("The cart is empty.");
            }

            var order = new Customerorder
            {
                CustomerId = userId,
                OrderDate = DateTime.Now,
                Status = "Pending"
            };

            foreach (var cartItem in cart.Cartitems)
            {
                var product = await _context.Products.FindAsync(cartItem.ProductId);
                if (product == null)
                {
                    return BadRequest($"Product with ID {cartItem.ProductId} does not exist.");
                }

                if (cartItem.Quantity > product.Quantity)
                {
                    return BadRequest($"Insufficient quantity available for product with ID {cartItem.ProductId}.");
                }

                var orderItem = new Orderitem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity
                };

                order.Orderitems.Add(orderItem);

                product.Quantity -= cartItem.Quantity;
            }

            _context.Customerorders.Add(order);

            cart.Cartitems.Clear();

            await _context.SaveChangesAsync();

            return Ok();
        }


        [HttpDelete("{orderId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            var order = await _context.Customerorders
                .Include(o => o.Orderitems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                return NotFound();
            }

            _context.Orderitems.RemoveRange(order.Orderitems);

            _context.Customerorders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<List<OrderItemDto>>> GetOrdersByUser(int userId)
        {
            var orders = await _context.Customerorders
                .Include(o => o.Orderitems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.CustomerId == userId)
                .ToListAsync();

            var orderItems = orders.SelectMany(o => o.Orderitems)
                .Select(oi => new OrderItemDto
                {
                    OrderId = (int)oi.OrderId,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    CustomerId = oi.Order.CustomerId,
                    Status = oi.Order.Status,
                })
                .ToList();

            return Ok(orderItems);
        }



        [HttpPut("{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] OrderStatusUpdateDto orderStatusDto)
        {
            var order = await _context.Customerorders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = orderStatusDto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }



    }
}
