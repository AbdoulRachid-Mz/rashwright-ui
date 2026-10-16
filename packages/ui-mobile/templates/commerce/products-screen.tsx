// @/components/templates/commerce/products-screen.tsx
/**
 * ProductsScreen — Écran catalogue des produits pour Rashwright UI Mobile.
 * Grille fluide, filtres par catégorie, recherche et badge panier en temps réel.
 */

import React, { useState, useMemo } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Badge from "@/components/ui/badge";
import { CategoryFilter } from "./components/category-filter";
import { ProductCard } from "./components/product-card";
import type { Product, ProductsScreenProps } from "./types";

export const SAMPLE_COMMERCE_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Smartphone Nexa Pro",
    description: "Écran AMOLED 120Hz, triple capteur photo IA et autonomie record 48h.",
    fullDescription: "Le Smartphone Nexa Pro redéfinit les standards mobiles avec son processeur gravé en 3nm, son écran Dynamic AMOLED 6.7 pouces ultra-lumineux et son système de refroidissement thermique liquide.",
    price: 899.99,
    priceLabel: "899,99 €",
    rating: 4.8,
    reviewCount: 342,
    category: "Électronique",
    inStock: true,
    badge: "Populaire",
    icon: "📱",
    features: [
      "Écran 6.7'' AMOLED 120Hz Adaptatif",
      "Triple capteur 108 MP avec zoom optique 5x",
      "Batterie 5200 mAh & charge rapide 65W",
      "5G double SIM & Wi-Fi 7",
    ],
    colors: ["#0F172A", "#2563EB", "#059669"],
    sizes: ["128 Go", "256 Go", "512 Go"],
  },
  {
    id: "prod-2",
    name: "Écouteurs Horizon Pods",
    description: "Réduction active de bruit intelligente et audio spatial haute fidélité.",
    fullDescription: "Plongez dans un silence absolu grâce à la réduction de bruit adaptative à 4 micros. Confort ergonomique longue durée et boîtier de recharge sans fil en aluminium brossé.",
    price: 179.99,
    priceLabel: "179,99 €",
    rating: 4.6,
    reviewCount: 189,
    category: "Audio",
    inStock: true,
    badge: "Nouveau",
    icon: "🎧",
    features: [
      "Réduction active de bruit (ANC) jusqu'à -42 dB",
      "Audio spatial 360° avec suivi de tête",
      "32h d'autonomie avec le boîtier MagSafe",
      "Résistance à l'eau et transpiration IPX5",
    ],
    colors: ["#FFFFFF", "#0F172A"],
    sizes: ["Standard"],
  },
  {
    id: "prod-3",
    name: "Montre Chrono Titan",
    description: "Boîtier titane aérospatial, suivi GPS multi-bandes et capteur santé 24/7.",
    fullDescription: "Conçue pour les athlètes exigeants et les aventuriers. Verre saphir inrayable, résistance à l'eau 100m, et capteurs ECG / SpO2 de précision médicale.",
    price: 349.99,
    priceLabel: "349,99 €",
    rating: 4.9,
    reviewCount: 512,
    category: "Montres",
    inStock: true,
    badge: "Best-seller",
    icon: "⌚",
    features: [
      "Boîtier Titane Grade 5 & Verre Saphir",
      "Autonomie jusqu'à 14 jours en usage classique",
      "GPS bi-fréquence L1 + L5 ultra-précis",
      "Cardiofréquencemètre & oxymètre continu",
    ],
    colors: ["#475569", "#0F172A", "#D97706"],
    sizes: ["42 mm", "46 mm"],
  },
  {
    id: "prod-4",
    name: "Étui Cuir Artisanal",
    description: "Cuir pleine fleur tanné végétal avec doublure microfibre douce.",
    fullDescription: "Fabriqué à la main avec du cuir italien de premier choix. Patine unique qui s'embellit avec le temps, compatible avec tous les accessoires magnétiques.",
    price: 49.99,
    priceLabel: "49,99 €",
    rating: 4.4,
    reviewCount: 78,
    category: "Accessoires",
    inStock: true,
    icon: "💼",
    features: [
      "Cuir véritable pleine fleur de Toscane",
      "Bords surélevés pour protéger l'écran et la caméra",
      "Compatible charge sans fil et fixation magnétique",
    ],
    colors: ["#78350F", "#0F172A", "#059669"],
    sizes: ["Taille Unique"],
  },
];

export const SAMPLE_CATEGORIES = ["Tous", "Électronique", "Audio", "Montres", "Accessoires"];

export function ProductsScreen({
  products = SAMPLE_COMMERCE_PRODUCTS,
  categories = SAMPLE_CATEGORIES,
  cartCount = 0,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
}: ProductsScreenProps) {
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tous") return products;
    return products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding & Panier */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              Boutique
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
              Produits premium & accessoires certifiés
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenCart}
              style={[
                styles.cartButton,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <RashwrightLogo size={36} />
          </View>
        </View>

        {/* Barre de filtres de catégories */}
        <View style={styles.filterSection}>
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* Grille de produits */}
        <View style={styles.gridContainer}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() => onSelectProduct(product.id)}
                onAddToCart={() => onAddToCart?.(product.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  filterSection: {
    marginVertical: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
});

export default ProductsScreen;
