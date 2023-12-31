import { Icategory } from "../model/category";
import { IProduct } from "../model/product";
import { ICartItem } from "../model/cartItem";
import { IUserDetails } from "../model/user-details";
import { ICart } from "../model/cart";
import { IOrder } from "../model/order";
import API_BASE_URL from "./base-url";


export async function getTopProducts() {
    return await fetch(`${API_BASE_URL}/products`).then(response => {
        return response.json()
    }) as IProduct[];
}

export async function getProductById(productId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (response.ok) {
      const product = await response.json();
      return product as IProduct;
    } else {
      throw new Error("Product not found.");
    }
  } catch (error) {
    throw new Error("Failed to fetch product data.");
  }
}


export async function getCategories() {
    return await fetch(`${API_BASE_URL}/category`).then(response => {
        return response.json()
    }) as Icategory[];
}

export async function getProductsOfCategory(categoryId: number) {
    return await fetch(`${API_BASE_URL}/category/${categoryId}/products`).then(response => {
        return response.json()
    }) as IProduct[];
}

export async function login(email: string, password: string) {
    const body = {
        email: email,
        password: password
    }
    const response = await fetch(`${API_BASE_URL}/authentication/login`,
        {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    if (response.ok) {
        const responseBody = await response.text();
        return responseBody;
    } 
    else 
        return undefined;
}

export async function register(email: string, password: string, userRole: string) {
    const body = {
      email: email,
      password: password,
      userRole: userRole
    };
    const response = await fetch(`${API_BASE_URL}/authentication/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }

export async function getUserInfo(email: string) {
    return await fetch(`${API_BASE_URL}/authentication/${email}`, 
    {
        method: 'GET', 
        headers: { Authorization: `Bearer ${localStorage.getItem("loginToken")}` },
    }).then(response => {
        return response.json()
    }) as IUserDetails;
}

export async function insertProduct(product: IProduct) {
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
  
    if (response.ok) {
      const insertedProduct = await response.json();
      return insertedProduct;
    } else {
      throw new Error("Failed to insert product.");
    }
  }

  
export async function insertCategory(category: Icategory) {
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });
  
    if (response.ok) {
      const insertedCategory = await response.json();
      return insertedCategory;
    } else {
      throw new Error("Failed to insert categroy.");
    }
  }

  export async function deleteCategory(categoryId: number){
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status;
  }
  
  export async function deleteProduct(productId: number) {
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.status;
  }

  export async function addToCart(userId: number, cartItem: ICart) {
    const response = await fetch(`${API_BASE_URL}/cart/user/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("loginToken")}`,
      },
      body: JSON.stringify(cartItem),
    });
  
    if (response.ok) {
      return response.status;
    } else {
      throw new Error("Failed to add item to cart.");
    }
  }
  

  export async function getCartItems(userId: number) {
    try {
      const token = localStorage.getItem("loginToken");
      const response = await fetch(`${API_BASE_URL}/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const cartItems = await response.json();
        return cartItems as ICartItem[];
      } else {
        throw new Error("Failed to fetch cart items.");
      }
    } catch (error) {
      throw new Error("Failed to fetch cart items.");
    }
  }

  export async function removeFromCart(userId: number, cartItemId: number) {
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      return response.status;
    } else {
      throw new Error("Failed to remove item from cart.");
    }
  }
  
  export async function getAllOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("loginToken")}`,
        },
      });
  
      if (response.ok) {
        const orders = await response.json();
        return orders as IOrder[];
      } else {
        throw new Error("Failed to fetch orders.");
      }
    } catch (error) {
      throw new Error("Failed to fetch orders.");
    }
  }
  
  export async function placeOrder(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("loginToken")}`,
        },
      });
  
      if (response.ok) {
        return true;
      } else if (response.status === 404) {
        throw new Error("User not found.");
      } else if (response.status === 400) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      } else {
        throw new Error("Failed to place order.");
      }
    } catch (error) {
      throw new Error("Failed to place order.");
    }
  }
  
  export async function getOrdersByUser(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("loginToken")}`,
        },
      });
  
      if (response.ok) {
        const orders = await response.json();
        return orders as IOrder[];
      } else {
        throw new Error("Failed to fetch orders for the user.");
      }
    } catch (error) {
      throw new Error("Failed to fetch orders for the user.");
    }
  }

  export async function updateOrderStatus(orderId: number, newStatus: string) {
    const token = localStorage.getItem("loginToken");
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
  
    if (response.ok) {
      const updatedOrder = await response.json();
      return updatedOrder;
    } else {
      throw new Error("Failed to update order status.");
    }
  }
  
  