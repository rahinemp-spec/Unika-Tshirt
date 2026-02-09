
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'Modern' | 'Vintage' | 'Abstract' | 'Custom';
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export type View = 'home' | 'shop' | 'designer' | 'cart' | 'product-detail' | 'checkout' | 'success' | 'tracking' | 'admin';
