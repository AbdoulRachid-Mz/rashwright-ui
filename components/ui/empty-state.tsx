import React, { ReactNode } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidBlob from "./liquid/liquid-blob";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
  action?: ReactNode;
  withBlob?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  subtitle,
  action,
  withBlob = true,
  style,
}) => {
  const { theme } = useTheme();
  const desc = description || subtitle;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <Ionicons
          name={icon as any}
          size={36}
          color={theme.colors.primary}
        />
      );
    }
    return icon;
  };

  return (
    <View style={[styles.container, style]}>
      {withBlob && (
        <LiquidBlob
          size={180}
          color="primary"
          blur={35}
          opacity={0.12}
          style={styles.blob}
        />
      )}

      {icon && (
        <LiquidSurface
          material="soft"
          borderRadius={theme.borderRadius.full}
          style={styles.iconSurface}
        >
          <View style={styles.iconInner}>{renderIcon()}</View>
        </LiquidSurface>
      )}

      <View style={styles.textContainer}>
        <ThemedText variant="lg" weight="bold" style={styles.titleText}>
          {title}
        </ThemedText>
        {desc && (
          <ThemedText
            variant="sm"
            color="mutedForeground"
            style={styles.descriptionText}
          >
            {desc}
          </ThemedText>
        )}
      </View>

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    position: "relative",
  },
  blob: {
    top: "15%",
    alignSelf: "center",
  },
  iconSurface: {
    marginBottom: 20,
    padding: 6,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
    maxWidth: 320,
  },
  titleText: {
    textAlign: "center",
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 24,
  },
});
