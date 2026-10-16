// @/components/templates/commerce/commerce-template.tsx
import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { ProductsScreen, SAMPLE_COMMERCE_PRODUCTS, SAMPLE_CATEGORIES } from "./products-screen";
import { ProductDetailScreen } from "./product-detail-screen";
import type { CartItem, CommerceTemplateProps } from "./types";

export function CommerceTemplate({
  products = SAMPLE_COMMERCE_PRODUCTS,
  categories = SAMPLE_CATEGORIES,
  cartItems: initialCartItems = [],
  initialProductId,
  onAddToCart,
  onViewProduct,
  onCheckout,
}: CommerceTemplateProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId || null);
  const [localCart, setLocalCart] = useState<CartItem[]>(initialCartItems);

  const cartCount = localCart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    onViewProduct?.(id);
  }, [onViewProduct]);

  const handleAddToCart = useCallback((id: string) => {
    setLocalCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { productId: id, quantity: 1 }];
    });
    onAddToCart?.(id);
  }, [onAddToCart]);

  const handleOpenCart = useCallback(() => {
    onCheckout?.();
  }, [onCheckout]);

  if (selectedProductId) {
    const activeProduct = products.find((p) => p.id === selectedProductId);
    return (
      <View style={styles.container}>
        <ProductDetailScreen
          productId={selectedProductId}
          product={activeProduct}
          onBack={() => setSelectedProductId(null)}
          onAddToCart={handleAddToCart}
          onOpenCart={handleOpenCart}
          cartCount={cartCount}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProductsScreen
        products={products}
        categories={categories}
        cartCount={cartCount}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
        onOpenCart={handleOpenCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CommerceTemplate;
