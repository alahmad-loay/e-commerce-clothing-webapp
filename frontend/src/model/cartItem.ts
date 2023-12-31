export interface ICartItem {
    cartId: number;
    cartItemId: number;
    product: {
     categoryId: number;
     description: string;
     imageUrl: string | null;
     name: string;
     price: number;
      productId: number;
      quantityAvailable: number;
    };
    productId: number;
    quantity: number;
  }
  