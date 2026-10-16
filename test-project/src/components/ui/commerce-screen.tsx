import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { CommerceTemplate } from "@/components/templates/commerce";

export function RashwrightCommerceScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <CommerceTemplate />
    </SafeAreaView>
  );
}

export default RashwrightCommerceScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
