import React from "react";
import { View, Image, StyleSheet, ImageStyle, ViewStyle, Text } from "react-native";

export interface RashwrightLogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

/**
 * Rashwright UI Logo Component
 * Displays the official Rashwright RS emblem + brand typography.
 */
export function RashwrightLogo({
  size = 120,
  showText = true,
  style,
  imageStyle,
}: RashwrightLogoProps) {
  // Try resolving primary.png from project assets
  let imageSource;
  try {
    // When imported in projects with assets folder
    imageSource = require("../../assets/primary.png");
  } catch {
    try {
      imageSource = require("../../../assets/primary.png");
    } catch {
      imageSource = null;
    }
  }

  return (
    <View style={[styles.container, style]}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            { width: size, height: size },
            imageStyle,
          ]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            { width: size, height: size, borderRadius: size / 4 },
          ]}
        >
          <Text style={[styles.fallbackRS, { fontSize: size * 0.4 }]}>RS</Text>
        </View>
      )}

      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.brandTitle}>Rashwright</Text>
          <Text style={styles.brandSubtitle}>UI MOBILE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    borderRadius: 24,
  },
  fallbackContainer: {
    backgroundColor: "#05070d",
    borderWidth: 2,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackRS: {
    color: "#00d9ff",
    fontWeight: "900",
  },
  textContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00d9ff",
    letterSpacing: 6,
    marginTop: 2,
  },
});

export default RashwrightLogo;
