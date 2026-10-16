// @/components/templates/commerce/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;        // en float (ex: 799.99)
  priceLabel: string;   // ex: "799,99 €"
  rating: number;       // 0-5
  reviewCount: number;
  category: string;
  inStock: boolean;
  badge?: string;       // ex: "Nouveau", "Promo", "Populaire"
  icon?: string;        // emoji ou symbole
  features?: string[];
  colors?: string[];
  sizes?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ProductsScreenProps {
  products?: Product[];
  categories?: string[];
  cartCount?: number;
  onSelectProduct: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onOpenCart?: () => void;
}

export interface ProductDetailScreenProps {
  productId?: string;
  product?: Product;
  onBack: () => void;
  onAddToCart?: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  onBuyNow?: (productId: string, quantity: number) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export interface CommerceTemplateProps {
  products?: Product[];
  categories?: string[];
  cartItems?: CartItem[];
  initialProductId?: string;
  onAddToCart?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
  onCheckout?: () => void;
}
