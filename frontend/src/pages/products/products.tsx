import React, { FC, useEffect, useState } from "react";
import "./products.css";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

//services
import { getTopProducts } from "../../services/api-service";
import { getCategories } from "../../services/api-service";
import { getProductsOfCategory } from "../../services/api-service";

// models
import { IProduct } from "../../model/product";
import { Icategory } from "../../model/category";

//helper
import { checkIfAdminUser } from "../../helper/function-helper";

export const ProductPage: FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [checkedCategoryId, setCheckedCategoryId] = useState<number>(0);

  const isAdmin = checkIfAdminUser();

  useEffect(() => {
    getAllProducts();
    getAllCategories();
  }, []);

  useEffect(() => {
    getAllProductsOfCategory(checkedCategoryId);
  }, [checkedCategoryId]);

  async function getAllProducts() {
    const allProducts = await getTopProducts();
    setProducts(allProducts);
  }

  async function getAllCategories() {
    const allCategories = await getCategories();
    setCategories(allCategories);
  }

  async function getAllProductsOfCategory(categoryId: number) {
    if (categoryId === 0) {
      const allProducts = await getTopProducts();
      setProducts(allProducts);
    } else {
      const allProductsOfCategory = await getProductsOfCategory(categoryId);
      setProducts(allProductsOfCategory);
    }
  }

  const handleCategoryChange = (categoryId: number) => {
    setCheckedCategoryId(categoryId === checkedCategoryId ? 0 : categoryId);
  };

  return (
    <>
      <div className="AllProducts">Shop</div>
      <div className="all">
        <div className="categories">
          <div className="head">Categories</div>
          {categories?.length > 0 && (
            <ul className="all-categories">
              <li className="single-category-container">
                <div>
                  <input
                    type="checkbox"
                    id="check 1"
                    checked={!checkedCategoryId}
                    onChange={() => handleCategoryChange(0)}
                  />
                  <label htmlFor="check 1">Show All</label>
                </div>
              </li>
              {categories.map((category, index) => {
                const inputId = `check ${index + 2}`;
                const labelFor = `check ${index + 2}`;
                return (
                  <li className="single-category-container" key={index}>
                    <div>
                      <input
                        type="checkbox"
                        id={inputId}
                        checked={checkedCategoryId === category.categoryId}
                        onChange={() => handleCategoryChange(category.categoryId)}
                      />
                      <label htmlFor={labelFor}>
                        {category.name}{" "}
                        {isAdmin && <span className="category-id">ID:{category.categoryId}</span>}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {products?.length > 0 && (
          <div className="product-container">
            {products.map((product, index) => {
              return (
                <div className="single-product-container" key={index}>
                  <img className="product-img" src={product.imageUrl} alt="img" />
                  <div className="card-body">
                    <div className="card-title">{product.name}</div>
                    <div className="card-text">{product.description}</div>
                  </div>
                  <div className="card-footer">
                    <small className="text-muted">Quantity: {product.quantityAvailable}</small>
                    <small className="text-muted">Price: ${product.price}</small>
                    {isAdmin && <small className="text-muted">ID: {product.productId}</small>}
                  </div>
                  <Link to={`/products/${product.productId}`}>
                    <Button className="add-to-cart-btn" variant="dark">
                      Add to cart
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};