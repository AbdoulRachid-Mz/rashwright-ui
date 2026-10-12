// @/components/templates/commerce/components/product-card.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Rating from '@/components/ui/rating';
import { useTheme } from '@/contexts/theme-context';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function ProductCard({ product, onAddToCart, onPress }: ProductCardProps) {
  const { theme } = useTheme();

  const initials = product.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(product.id)}
      style={styles.wrapper}
    >
      <Card variant="glass" style={styles.card}>
        {/* Placeholder image */}
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: theme.colors.muted },
          ]}
        >
          <Text style={[styles.initials, { color: theme.colors.mutedForeground }]}>
            {initials || '🛍'}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Name */}
          <Text
            style={[styles.name, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {product.name}
          </Text>

          {/* Description */}
          <Text
            style={[styles.description, { color: theme.colors.mutedForeground }]}
            numberOfLines={2}
          >
            {product.description}
          </Text>

          {/* Price + badge */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              {product.priceLabel}
            </Text>
            {product.badge ? (
              <Badge variant="default" style={styles.badgeOffset}>
                {product.badge}
              </Badge>
            ) : null}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Rating readonly value={product.rating} size="sm" />
            <Text
              style={[styles.reviewCount, { color: theme.colors.mutedForeground }]}
            >
              {' '}
              ({product.reviewCount})
            </Text>
          </View>

          {/* Add to cart */}
          <Button
            variant="default"
            size="sm"
            disabled={!product.inStock}
            onPress={() => onAddToCart?.(product.id)}
            style={styles.button}
          >
            {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
  },
  card: {
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    padding: 12,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  badgeOffset: {
    alignSelf: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 11,
  },
  button: {
    marginTop: 4,
  },
});

export default ProductCard;
