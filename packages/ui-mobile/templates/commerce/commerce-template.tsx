// @/components/templates/commerce/commerce-template.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import RashwrightLogo from '@/components/ui/rashwright-logo';
import { useTheme } from '@/contexts/theme-context';
import { ProductCard } from './components/product-card';
import { CategoryFilter } from './components/category-filter';
import type { Product, CartItem, CommerceTemplateProps } from './types';

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_CATEGORIES: string[] = [
  'Électronique',
  'Audio',
  'Montres',
  'Accessoires',
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Smartphone Pro Max',
    description:
      'Écran AMOLED 6,7", triple capteur 200 Mpx, batterie 5 000 mAh.',
    price: 89999,
    priceLabel: '899,99 €',
    rating: 4.5,
    reviewCount: 1248,
    category: 'Électronique',
    inStock: true,
    badge: 'Nouveau',
  },
  {
    id: '2',
    name: 'Écouteurs Sans-fil ANC',
    description:
      'Réduction de bruit active, autonomie 30 h, charge rapide 10 min.',
    price: 14999,
    priceLabel: '149,99 €',
    rating: 4.2,
    reviewCount: 867,
    category: 'Audio',
    inStock: true,
    badge: 'Promo',
  },
  {
    id: '3',
    name: 'Montre Connectée Sport',
    description:
      'GPS intégré, suivi cardio 24/7, étanche 50 m, autonomie 7 jours.',
    price: 29999,
    priceLabel: '299,99 €',
    rating: 4.7,
    reviewCount: 532,
    category: 'Montres',
    inStock: true,
  },
  {
    id: '4',
    name: 'Étui Cuir Premium',
    description:
      'Cuir véritable pleine fleur, compatible tous modèles, 3 coloris.',
    price: 3999,
    priceLabel: '39,99 €',
    rating: 3.8,
    reviewCount: 214,
    category: 'Accessoires',
    inStock: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommerceTemplate({
  products = DEMO_PRODUCTS,
  categories = DEMO_CATEGORIES,
  cartItems,
  onAddToCart,
  onViewProduct,
  onCheckout,
}: CommerceTemplateProps) {
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [localCart, setLocalCart] = useState<CartItem[]>(cartItems ?? []);

  // Derived cart count
  const cartCount = localCart.reduce((acc, item) => acc + item.quantity, 0);

  // Filtered products
  const filteredProducts = useMemo<Product[]>(
    () =>
      selectedCategory === 'Tous'
        ? products
        : products.filter((p) => p.category === selectedCategory),
    [products, selectedCategory],
  );

  // Add to cart handler
  const handleAddToCart = useCallback(
    (productId: string) => {
      if (onAddToCart) {
        onAddToCart(productId);
        return;
      }
      setLocalCart((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }
        return [...prev, { productId, quantity: 1 }];
      });
    },
    [onAddToCart],
  );

  const handleCheckout = useCallback(() => {
    if (onCheckout) {
      onCheckout();
    } else {
      console.log('[CommerceTemplate] checkout', localCart);
    }
  }, [onCheckout, localCart]);

  // FlatList render item — two-column layout
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard
        product={item}
        onAddToCart={handleAddToCart}
        onPress={onViewProduct}
      />
    ),
    [handleAddToCart, onViewProduct],
  );

  const keyExtractor = (item: Product) => item.id;

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>
            Boutique
          </Text>
          {cartCount > 0 && (
            <Badge variant="default" style={styles.cartBadge}>
              {String(cartCount)}
            </Badge>
          )}
        </View>
        <RashwrightLogo size={28} />
      </View>

      {/* Category filter */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Product grid */}
      <FlatList<Product>
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text
            style={[styles.emptyText, { color: theme.colors.mutedForeground }]}
          >
            Aucun produit dans cette catégorie.
          </Text>
        }
      />

      {/* Checkout button */}
      {localCart.length > 0 && (
        <View
          style={[
            styles.checkoutBar,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <Button variant="default" onPress={handleCheckout} style={styles.checkoutBtn}>
            {`Valider le panier (${cartCount})`}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  cartBadge: {
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  checkoutBar: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  checkoutBtn: {
    width: '100%',
  },
});

export default CommerceTemplate;
