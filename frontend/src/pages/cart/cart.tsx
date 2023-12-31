import React, { FC, useEffect, useState } from "react";
import { getCartItems, getUserInfo, getProductById, removeFromCart } from "../../services/api-service";
import { ICartItem } from "../../model/cartItem";
import { IUserDetails } from "../../model/user-details";
import { getLoggedInUserDetails } from "../../helper/function-helper";
import { Card, Button, Spinner, Modal } from "react-bootstrap";
import { placeOrder } from "../../services/api-service";
import "./cart.css";

export const CartPage: FC = () => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const userDetails = getLoggedInUserDetails();

  const fetchCartItems = async () => {
    try {
      const userInfo = await getUserInfo(userDetails?.email || "");
      const items = await getCartItems(userInfo.userId);

      const updatedItems = await Promise.all(items.map(async (item) => {
        const product = await getProductById(item.productId);
        return { ...item, product };
      }));

      setCartItems(updatedItems as ICartItem[]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userDetails) {
      fetchCartItems();
    } else {
      setIsLoading(false);
    }
  }, [userDetails]);

  const handleRemoveFromCart = async (cartItemId: number) => {
    try {
      const userInfo = await getUserInfo(userDetails?.email || "");
      await removeFromCart(userInfo.userId, cartItemId);
      fetchCartItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleProceedToCheckout = () => {
    setShowModal(true);
  };

  const handleCancelOrder = () => {
    setShowModal(false);
    setOrderPlaced(false); // Reset the orderPlaced state
  };

  const handlePlaceOrder = async () => {
    setShowModal(false);
    try {
      if (cartItems.length === 0) {
        throw new Error("Cannot place an order with an empty cart.");
      }
      const userDetails = getLoggedInUserDetails();
      if (userDetails) {
        const response = await placeOrder(userDetails.userId);
        if (response) {
          setOrderPlaced(true);
          window.alert("Order placed successfully! You can track your orders in your account page.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status"></Spinner>
      </div>
    );
  }

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.product?.price * item.quantity, 0);
  };

  return (
    <div className="cart-container">
      <h2>Cart</h2>
      {cartItems.length > 0 ? (
        <div className="all-cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              {item.product && (
                <div className="cart-item-content">
                  <Card.Img variant="top" src={item.product.imageUrl as string} alt={item.product.name} className="cart-item-image" />
                  <Card.Body>
                    <Card.Title>{item.product.name}</Card.Title>
                    <Card.Text>Quantity: {item.quantity}</Card.Text>
                    <Card.Text>Price: ${item.product.price}</Card.Text>
                    <Button variant="danger" onClick={() => handleRemoveFromCart(item.cartItemId)}>
                      Remove
                    </Button>
                  </Card.Body>
                </div>
              )}
            </div>
          ))}
          <div className="checkout-button">
            <Button variant="dark" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </Button>
          </div>
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Checkout</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Total Price: ${calculateTotalPrice()}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCancelOrder}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div className="empty-cart">No items in the cart.</div>
      )}
    </div>
  );
};
