// @/components/ui/loading-state.tsx
//
// Composant d'état de chargement thématique avec indicateur Liquid Glass et message.

import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidBlob from "./liquid/liquid-blob";

export interface LoadingStateProps {
  message?: string;
  withBlob?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Chargement en cours...",
  withBlob = true,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {withBlob && (
        <LiquidBlob
          size={160}
          color="primary"
          blur={30}
          opacity={0.12}
          style={styles.blob}
        />
      )}

      <LiquidSurface
        material="soft"
        borderRadius={theme.borderRadius.full}
        style={styles.indicatorSurface}
      >
        <View style={styles.indicatorInner}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </LiquidSurface>

      {message && (
        <ThemedText
          variant="sm"
          weight="medium"
          color="mutedForeground"
          style={styles.message}
        >
          {message}
        </ThemedText>
      )}
    </View>
  );
};

export default LoadingState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    position: "relative",
  },
  blob: {
    alignSelf: "center",
  },
  indicatorSurface: {
    padding: 8,
    marginBottom: 16,
  },
  indicatorInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    textAlign: "center",
  },
});
