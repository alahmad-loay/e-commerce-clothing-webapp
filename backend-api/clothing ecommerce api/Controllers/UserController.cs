using clothing_ecommerce_api.Entities;
using clothing_ecommerce_api.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;
using System.Text.Json;
using clothing_ecommerce_api.Models;
using Org.BouncyCastle.Asn1.Ocsp;

namespace clothing_ecommerce_api.Controllers
{
    [Route("api/authentication")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ClothesStoreContext _context;
        private readonly IConfiguration _configuration;

        public UserController(ClothesStoreContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<List<UserDto>>> Get()
        {
            var userList = await _context.Users.Select(
                User => new UserDto
                {
                    UserId = User.UserId,
                    Email = User.Email,
                    userRole = User.UserRole

                }
            ).ToListAsync();

            if (userList.Count < 1)
            {
                return NotFound();
            }
            else
            {
                return userList;
            }
        }


        [HttpGet("{userId}/details")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<object>> GetCustomerDetails(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var customerOrders = await _context.Customerorders
                .Include(o => o.Orderitems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.CustomerId == userId)
                .Select(o => new
                {
                    o.OrderId,
                    o.CustomerId,
                    o.OrderDate,
                    OrderItems = o.Orderitems.Select(oi => new
                    {
                        oi.OrderItemId,
                        oi.ProductId,
                        oi.Quantity
                    }).ToList()
                })
                .ToListAsync();

            var cart = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Cartitems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync();

            var cartDto = new CartDto
            {
                CartId = cart?.CartId ?? 0,
                UserId = cart?.UserId ?? 0,
                OrderId = cart?.OrderId ?? 0,
                Items = cart?.Cartitems.Select(ci => new CartItemDto
                {
                    CartItemId = ci.CartItemId,
                    CartId = ci.CartId,
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    Product = new ProductDto
                    {
                        ProductId = ci.Product.ProductId,
                        Name = ci.Product.Name,
                        QuantityAvailable = ci.Product.Quantity,
                        Description = ci.Product.Description,
                        CategoryId = ci.Product?.CategoryId ?? 0
                    }
                }).ToList()
            };

            var customerDetails = new
            {
                UserId = user.UserId,
                Email = user.Email,
                UserRole = user.UserRole,
                Orders = customerOrders,
                Cart = cartDto
            };

            return customerDetails;
        }





        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest();
            }

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                UserRole = request.userRole?.ToLower() == "admin" ? "Admin" : "Customer"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (user.UserRole == "Customer")
            {
                var cart = new Cart
                {
                    UserId = user.UserId
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return Ok();
        }




        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest();
            }

            if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return BadRequest();
            }

            string token = CreateToken(user);
            return Ok(token);
        }


        [HttpDelete("{userId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            if (user.Email == "admin@gmail.com" || user.Email == "customer@gmail.com")
            {
                return BadRequest();
            }

            if (user.UserRole == "Customer")
            {
                var cart = await _context.Carts.Include(c => c.Cartitems).FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart != null)
                {
                    _context.Cartitems.RemoveRange(cart.Cartitems);
                }

                var orders = await _context.Customerorders.Where(o => o.CustomerId == userId).ToListAsync();
                _context.Customerorders.RemoveRange(orders);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("{email}")]
        public async Task<ActionResult<UserDto>> GetLoggedUser(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                userRole = user.UserRole
            };

            return userDto;
        }


        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                 new Claim(ClaimTypes.Email, user.Email)
            };

            if (user.UserRole == "Admin")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, "Customer"));
            }

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }


        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {

            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }
    }
}
