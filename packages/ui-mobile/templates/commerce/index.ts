// @/components/templates/commerce/index.ts
export { CommerceTemplate } from "./commerce-template";
export { ProductsScreen, SAMPLE_COMMERCE_PRODUCTS, SAMPLE_CATEGORIES } from "./products-screen";
export { ProductDetailScreen } from "./product-detail-screen";
export { ProductCard } from "./components/product-card";
export { CategoryFilter } from "./components/category-filter";

export type {
  Product,
  CartItem,
  ProductsScreenProps,
  ProductDetailScreenProps,
  CommerceTemplateProps,
} from "./types";

export default CommerceTemplate;
