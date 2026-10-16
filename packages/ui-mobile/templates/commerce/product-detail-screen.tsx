// @/components/templates/commerce/product-detail-screen.tsx
/**
 * ProductDetailScreen — Écran complet de détail d'un produit (productId) pour Rashwright UI.
 * Inclut sélection de variantes (couleur, taille), caractéristiques, avis et ajout au panier.
 */

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Rating from "@/components/ui/rating";
import Divider from "@/components/ui/divider";
import { SAMPLE_COMMERCE_PRODUCTS } from "./products-screen";
import type { Product, ProductDetailScreenProps } from "./types";

export function ProductDetailScreen({
  productId = "prod-1",
  product: initialProduct,
  onBack,
  onAddToCart,
  onBuyNow,
  onOpenCart,
  cartCount = 0,
}: ProductDetailScreenProps) {
  const { theme, isDark } = useTheme();

  // Résoudre le produit à afficher
  const product: Product =
    initialProduct ||
    SAMPLE_COMMERCE_PRODUCTS.find((p) => p.id === productId) ||
    SAMPLE_COMMERCE_PRODUCTS[0];

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const handleAddToCart = () => {
    setIsAddedFeedback(true);
    onAddToCart?.(product.id, quantity, selectedColor, selectedSize);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[
            styles.navButton,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <Text style={[styles.navIcon, { color: theme.colors.foreground }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.colors.foreground }]} numberOfLines={1}>
          {product.name}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenCart}
          style={[
            styles.navButton,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <Text style={styles.navIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Showcase avec Liquid Glass */}
        <Card variant="glass" style={styles.heroCard}>
          <View style={styles.heroImageContainer}>
            <Text style={styles.heroIconText}>{product.icon || "📦"}</Text>
            {product.badge && (
              <View style={styles.heroBadge}>
                <Badge variant="default" size="sm">
                  {product.badge}
                </Badge>
              </View>
            )}
            <View style={styles.heroStockBadge}>
              <Badge variant="outline" size="sm">
                {product.inStock ? "✓ En Stock" : "Rupture"}
              </Badge>
            </View>
          </View>
        </Card>

        {/* Détails Principaux */}
        <View style={styles.detailsSection}>
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {product.category.toUpperCase()}
          </Text>

          <Text style={[styles.productTitle, { color: theme.colors.foreground }]}>
            {product.name}
          </Text>

          {/* Ligne Avis et Note */}
          <View style={styles.ratingRow}>
            <Rating value={product.rating} readonly size="sm" />
            <Text style={[styles.ratingScore, { color: theme.colors.foreground }]}>
              {product.rating}
            </Text>
            <Text style={[styles.reviewCount, { color: theme.colors.mutedForeground }]}>
              ({product.reviewCount} avis vérifiés)
            </Text>
          </View>

          {/* Prix Grand Format */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
              {product.priceLabel}
            </Text>
            <Text style={[styles.taxInfo, { color: theme.colors.mutedForeground }]}>
              TVA incluse · Livraison gratuite
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Sélection de Couleur */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                Finition & Couleur
              </Text>
              <View style={styles.colorOptionsRow}>
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      activeOpacity={0.8}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        isSelected && {
                          borderColor: theme.colors.primary,
                          borderWidth: 3,
                          transform: [{ scale: 1.15 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Sélection de Taille / Capacité */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                Capacité / Taille
              </Text>
              <View style={styles.sizeOptionsRow}>
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizeButton,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : isDark
                            ? "rgba(255,255,255,0.06)"
                            : "#F1F5F9",
                          borderColor: isSelected
                            ? theme.colors.primary
                            : isDark
                            ? "rgba(255,255,255,0.12)"
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          {
                            color: isSelected
                              ? "#FFFFFF"
                              : theme.colors.foreground,
                          },
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Sélecteur de Quantité */}
          <View style={styles.optionSection}>
            <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
              Quantité
            </Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={[
                  styles.quantityBtn,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                  },
                ]}
              >
                <Text style={[styles.quantityBtnText, { color: theme.colors.foreground }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityValue, { color: theme.colors.foreground }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={[
                  styles.quantityBtn,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                  },
                ]}
              >
                <Text style={[styles.quantityBtnText, { color: theme.colors.foreground }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description Complète */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
              Description
            </Text>
            <Text style={[styles.descriptionBody, { color: theme.colors.mutedForeground }]}>
              {product.fullDescription || product.description}
            </Text>
          </View>

          {/* Points Forts & Spécifications */}
          {product.features && product.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                Caractéristiques Principales
              </Text>
              <View style={styles.featureList}>
                {product.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Text style={[styles.featureBullet, { color: theme.colors.primary }]}>✦</Text>
                    <Text style={[styles.featureText, { color: theme.colors.foreground }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barre d'action inférieure fixe */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
          },
        ]}
      >
        <View style={styles.bottomPriceCol}>
          <Text style={[styles.bottomPriceLabel, { color: theme.colors.mutedForeground }]}>
            Total
          </Text>
          <Text style={[styles.bottomPriceValue, { color: theme.colors.foreground }]}>
            {totalPrice} €
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Button
            variant="default"
            size="lg"
            onPress={handleAddToCart}
            style={styles.addCartBtn}
          >
            {isAddedFeedback ? "✓ Ajouté au panier !" : "Ajouter au panier"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  navIcon: {
    fontSize: 18,
    fontWeight: "700",
  },
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroImageContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroIconText: {
    fontSize: 84,
  },
  heroBadge: {
    position: "absolute",
    top: 14,
    left: 14,
  },
  heroStockBadge: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewCount: {
    fontSize: 13,
  },
  priceRow: {
    marginTop: 14,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  taxInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  optionSection: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  colorOptionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  sizeOptionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sizeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityBtnText: {
    fontSize: 18,
    fontWeight: "700",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureBullet: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  bottomPriceCol: {
    justifyContent: "center",
  },
  bottomPriceLabel: {
    fontSize: 12,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  bottomActions: {
    flex: 1,
    marginLeft: 20,
  },
  addCartBtn: {
    width: "100%",
  },
});

export default ProductDetailScreen;
