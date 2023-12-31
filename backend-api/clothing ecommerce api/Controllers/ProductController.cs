using clothing_ecommerce_api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using clothing_ecommerce_api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using clothing_ecommerce_api.Models;

namespace clothing_ecommerce_api.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ClothesStoreContext _clothesStoreContext;

        public ProductController(ClothesStoreContext clothesStoreContext)
        {
            _clothesStoreContext = clothesStoreContext;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductDto>>> Get()
        {
            var productList = await _clothesStoreContext.Products
                .Include(p => p.Category)
                .Select(
                Product => new ProductDto
                {
                    ProductId = Product.ProductId,
                    Name = Product.Name,
                    Description = Product.Description,
                    QuantityAvailable = Product.Quantity ?? 0,
                    CategoryId = Product.CategoryId ?? 0,
                    Price = Product.Price ?? 0,
                    ImageUrl = Product.ImageUrl
                }
            ).ToListAsync();

            if (productList.Count == 0)
            {
                return NotFound();
            }
            else
            {
                return productList;
            }
        }

        [HttpGet("{Id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetProductById(int Id)
        {
            var product = await _clothesStoreContext.Products.FindAsync(Id);

            if (product == null)
            {
                return NotFound();
            }

            var productDto = new ProductDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                QuantityAvailable = product.Quantity ?? 0,
                CategoryId = product.CategoryId ?? 0,
                Price = product.Price ?? 0,
                ImageUrl = product.ImageUrl
            };

            return productDto;
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<HttpStatusCode> InsertProduct(ProductDto product)
        {
            if (product.CategoryId != null)
            {
                var categoryExists = await _clothesStoreContext.Categories.AnyAsync(c => c.CategoryId == product.CategoryId);
                if (!categoryExists)
                {
                    return HttpStatusCode.BadRequest;
                }
            }
            var entity = new Product()
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                Quantity = product.QuantityAvailable,
                CategoryId = product.CategoryId ?? null,
                Price = product.Price,
                ImageUrl = product.ImageUrl
            };
            _clothesStoreContext.Products.Add(entity);
            await _clothesStoreContext.SaveChangesAsync();

            return HttpStatusCode.Created;
        }

        [HttpPut("{Id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<HttpStatusCode> UpdateProduct(int Id, ProductDto product)
        {
            if (product.CategoryId != null)
            {
                var categoryExists = await _clothesStoreContext.Categories.AnyAsync(c => c.CategoryId == product.CategoryId);
                if (!categoryExists)
                {
                    return HttpStatusCode.BadRequest;
                }
            }
            var entity = await _clothesStoreContext.Products.FindAsync(Id);
            if (entity == null)
            {
                return HttpStatusCode.NotFound;
            }

            entity.Name = product.Name;
            entity.Description = product.Description;
            entity.Quantity = product.QuantityAvailable;
            entity.CategoryId = product.CategoryId;
            entity.Price = product.Price;
            entity.ImageUrl = product.ImageUrl;

            await _clothesStoreContext.SaveChangesAsync();

            return HttpStatusCode.OK;
        }

        [HttpDelete("{Id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteProduct(int Id)
        {
            var product = await _clothesStoreContext.Products.FindAsync(Id);
            if (product == null)
            {
                return NotFound();
            }

            _clothesStoreContext.Products.Remove(product); 

            var cartItems = await _clothesStoreContext.Cartitems.Where(ci => ci.ProductId == Id).ToListAsync();
            _clothesStoreContext.Cartitems.RemoveRange(cartItems);

            var orderItems = await _clothesStoreContext.Orderitems.Where(oi => oi.ProductId == Id).ToListAsync();
            _clothesStoreContext.Orderitems.RemoveRange(orderItems);

            await _clothesStoreContext.SaveChangesAsync();

            var orderIdList = orderItems.Select(oi => oi.OrderId).Distinct().ToList();
            foreach (var orderId in orderIdList)
            {
                var order = await _clothesStoreContext.Customerorders.Include(o => o.Orderitems).FirstOrDefaultAsync(o => o.OrderId == orderId);
                if (order != null && !order.Orderitems.Any())
                {
                    _clothesStoreContext.Customerorders.Remove(order);
                }
            }

            await _clothesStoreContext.SaveChangesAsync();

            return Ok();
        }




    }
}
