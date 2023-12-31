using clothing_ecommerce_api.Entities;
using clothing_ecommerce_api.models;
using clothing_ecommerce_api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace clothing_ecommerce_api.Controllers
{
    [Route("api/category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ClothesStoreContext _clothesStoreContext;

        public CategoryController(ClothesStoreContext clothesStoreContext)
        {
            _clothesStoreContext = clothesStoreContext;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<CategoryDto>>> Get()
        {
            var categoryList = await _clothesStoreContext.Categories.Select(
                category => new CategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name ?? String.Empty,
                }
            ).ToListAsync();
            if (categoryList.Count == 0)
            {
                return NotFound();
            }
            else
            {
                return categoryList;
            }
        }

        [HttpGet("{Id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<CategoryDto>> GetCategoryById(int Id)
        {
            var category = await _clothesStoreContext.Categories.FindAsync(Id);
            if (category == null)
            {
                return NotFound();
            }
            var categoryDto = new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name ?? String.Empty,
            };
            return categoryDto;
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<HttpStatusCode> InsertCategory(CategoryDto category)
        {
            var entity = new Category()
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            };
            _clothesStoreContext.Categories.Add(entity);
            await _clothesStoreContext.SaveChangesAsync();

            return HttpStatusCode.Created;
        }

        [HttpPut("{Id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<HttpStatusCode> UpdateCategory(int Id, CategoryDto category)
        {
            var entity = await _clothesStoreContext.Categories.FindAsync(Id);

            if (entity == null)
            {
                return HttpStatusCode.NotFound;
            }

            entity.Name = category.Name;
            await _clothesStoreContext.SaveChangesAsync();
            return HttpStatusCode.OK;
        }

        [HttpDelete("{Id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> DeleteCategory(int Id)
        {
            var category = await _clothesStoreContext.Categories.FindAsync(Id);
            if (category == null)
            {
                return NotFound();
            }

            var products = await _clothesStoreContext.Products
                .Where(p => p.CategoryId == Id)
                .ToListAsync();

            foreach (var product in products)
            {
                product.CategoryId = null;
            }

            _clothesStoreContext.Categories.Remove(category);
            await _clothesStoreContext.SaveChangesAsync();

            return Ok();
        }


        [HttpGet("{categoryId}/products")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductDto>>> GetCategoryProducts(int categoryId)
        {
            var category = await _clothesStoreContext.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return NotFound();
            }

            var products = await _clothesStoreContext.Products
                .Where(p => p.CategoryId == categoryId)
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name ?? string.Empty,
                    Description = p.Description ?? string.Empty,
                    QuantityAvailable = p.Quantity,
                    CategoryId = p.CategoryId,
                    Price = p.Price ?? 0,
                    ImageUrl = p.ImageUrl ?? string.Empty,

                })
                .ToListAsync();

            return products;
        }
    }
}
