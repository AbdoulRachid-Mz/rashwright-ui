// @/components/templates/commerce/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;        // en centimes ou float
  priceLabel: string;   // ex: "29,99 €"
  rating: number;       // 0-5
  reviewCount: number;
  category: string;
  inStock: boolean;
  badge?: string;       // ex: "Nouveau", "Promo"
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CommerceTemplateProps {
  products?: Product[];
  categories?: string[];
  cartItems?: CartItem[];
  onAddToCart?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
  onCheckout?: () => void;
}
