import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

// models
import { IUserDetails } from "../../model/user-details";
import { getLoggedInUserDetails } from "../../helper/function-helper";
import { getOrdersByUser } from "../../services/api-service";
import { IOrder } from "../../model/order";

export const MyAccount: FC = () => {
  const navigate = useNavigate();

  const [userDetails] = useState<IUserDetails>(getLoggedInUserDetails());
  const [orders, setOrders] = useState<IOrder[]>([]);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  async function fetchOrderHistory() {
    try {
      if (userDetails && userDetails.userRole === "Customer") {
        const userOrders = await getOrdersByUser(userDetails.userId);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error("Failed to fetch order history:", error);
    }
  }

  function logout() {
    localStorage.removeItem("loginToken");
    localStorage.removeItem("userDetails");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Welcome</h2>
      <Card>
        <Card.Body>
          <Card.Title>Account Details</Card.Title>
          <Card.Text>
            <p>
              <strong>Email:</strong> {userDetails?.email}
            </p>
            <div className="mt-4">
              <Button variant="primary" onClick={logout}>
                Logout
              </Button>
            </div>
          </Card.Text>
        </Card.Body>
      </Card>
      {userDetails && userDetails.userRole === "Customer" && (
        <div className="mt-4">
          <h4>Order History</h4>
          {orders.length > 0 ? (
            <ul>
              {orders.map((order) => (
                <li key={order.orderId}>
                  Order ID: {order.orderId}, Status: {order.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No order history found.</p>
          )}
        </div>
      )}
    </div>
  );
};
