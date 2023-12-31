import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { getProductById } from "../../services/api-service";
import { IProduct } from "../../model/product";
import { ICart } from "../../model/cart";
import { getLoggedInUserDetails } from "../../helper/function-helper";
import { addToCart } from "../../services/api-service";


import "./productDetail.css";

export const ProductDetailPage: FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          const productData = await getProductById(parseInt(productId));
          setProduct(productData);
        } catch (error) {
          console.error(error);
        }
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (product && quantity <= product.quantityAvailable) {
      if (quantity === 0) {
        setErrorMessage("Quantity cant be 0.");
        setSuccessMessage(null);
        return;
      }
  
      const loggedInUser = getLoggedInUserDetails();
      if (loggedInUser && loggedInUser.userRole === "Customer") {
        const cartItem: ICart = {
          productId: product.productId,
          quantity: quantity,
        };
        addToCart(loggedInUser.userId, cartItem)
          .then(() => {
            setErrorMessage(null);
            setSuccessMessage("Added to cart!");
          })
          .catch(() => {
            setErrorMessage("Failed to add item.");
            setSuccessMessage(null);
          });
      } else {
        setErrorMessage("Please log in.");
        setSuccessMessage(null);
      }
    } else {
      setErrorMessage("Invalid quantity.");
      setSuccessMessage(null);
    }
  };
  
  

  const handleGoBack = () => {
    navigate(-1); 
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-container-cart">
      {product ? (
        <div className="product-details">
          <div className="product-image">
            <img src={product.imageUrl} alt="Product" />
          </div>
          <div className="product-info">
            <h2 className="product-name">{product.name}</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <p className="product-description">{product.description}</p>
            <div className="product-quantity">
              <span className="label">Quantity:</span>
              <span className="value">{product.quantityAvailable}</span>
            </div>
            <div className="product-price">
              <span className="label">Price:</span>
              <span className="value">${product.price}</span>
            </div>
            <Form.Group controlId="quantity">
              <Form.Label className="label">Quantity</Form.Label>
              <Form.Control
                className="quantity-input"
                type="number"
                min={1}
                max={product.quantityAvailable}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </Form.Group>
            <Button className="add-to-cart-button" variant="dark" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="secondary" onClick={handleGoBack} className="back-button">
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div>Product not found.</div>
      )}
    </div>
  );
};
