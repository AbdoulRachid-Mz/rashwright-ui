// @/components/ui/glass-card.tsx
//
// Variante explicitement visuelle de Card.
// Expose directement le choix du matériau Glass (clear, soft, regular, thick, solid, floating)
// et la teinte (primary, secondary, accent, etc.) tout en conservant la composition Header/Title/etc.

import React, { createContext, useContext } from "react";
import {
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidPressable from "./liquid/liquid-pressable";
import type {
  LiquidMaterial,
  LiquidTint,
  LiquidIntensity,
} from "./liquid/liquid-types";

interface GlassCardContextType {
  theme: ReturnType<typeof useTheme>["theme"];
  isDark: boolean;
}

const GlassCardContext = createContext<GlassCardContextType | undefined>(
  undefined
);

const useGlassCardContext = () => {
  const context = useContext(GlassCardContext);
  if (!context) {
    throw new Error(
      "GlassCard compound components must be used within a GlassCard parent"
    );
  }
  return context;
};

export interface GlassCardProps {
  children: React.ReactNode;
  material?: LiquidMaterial;
  intensity?: LiquidIntensity;
  tint?: LiquidTint;
  noBlur?: boolean;
  borderRadius?: number;
  onPress?: TouchableOpacityProps["onPress"];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const GlassCardRoot = ({
  children,
  material = "floating",
  intensity = "medium",
  tint = "none",
  noBlur = false,
  borderRadius,
  onPress,
  disabled = false,
  style,
}: GlassCardProps) => {
  const { theme, isDark } = useTheme();

  const content = (
    <LiquidSurface
      material={material}
      intensity={intensity}
      tint={tint}
      noBlur={noBlur}
      borderRadius={borderRadius ?? theme.borderRadius.lg}
      style={[styles.container, style]}
    >
      {children}
    </LiquidSurface>
  );

  return (
    <GlassCardContext.Provider value={{ theme, isDark }}>
      {onPress ? (
        <LiquidPressable
          onPress={onPress}
          disabled={disabled}
          viscosity="medium"
          style={styles.pressableWrapper}
        >
          {content}
        </LiquidPressable>
      ) : (
        content
      )}
    </GlassCardContext.Provider>
  );
};

export interface GlassCardHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassCardHeader = ({ children, style }: GlassCardHeaderProps) => {
  const { theme } = useGlassCardContext();
  return (
    <View
      style={[
        styles.headerContainer,
        { marginBottom: theme.spacing.sm },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface GlassCardTitleProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

const GlassCardTitle = ({ children, style }: GlassCardTitleProps) => {
  const { theme } = useGlassCardContext();
  return (
    <ThemedText
      style={[
        styles.titleText,
        {
          fontSize: theme.typography.xl,
          color: theme.colors.cardForeground,
        },
        style,
      ]}
    >
      {children}
    </ThemedText>
  );
};

export interface GlassCardDescriptionProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

const GlassCardDescription = ({
  children,
  style,
}: GlassCardDescriptionProps) => {
  const { theme } = useGlassCardContext();
  return (
    <ThemedText
      style={[
        styles.descriptionText,
        {
          fontSize: theme.typography.sm,
          color: theme.colors.mutedForeground,
          marginTop: theme.spacing.xs,
        },
        style,
      ]}
    >
      {children}
    </ThemedText>
  );
};

export interface GlassCardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassCardContent = ({ children, style }: GlassCardContentProps) => {
  return (
    <View style={[styles.contentContainer, style]}>
      {children}
    </View>
  );
};

export interface GlassCardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassCardFooter = ({ children, style }: GlassCardFooterProps) => {
  const { theme } = useGlassCardContext();
  return (
    <View
      style={[
        styles.footerContainer,
        {
          gap: theme.spacing.sm,
          marginTop: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
  },
  pressableWrapper: {
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontWeight: "600",
  },
  descriptionText: {},
  contentContainer: {
    paddingVertical: 4,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

type GlassCardComponent = typeof GlassCardRoot & {
  Header: typeof GlassCardHeader;
  Title: typeof GlassCardTitle;
  Description: typeof GlassCardDescription;
  Content: typeof GlassCardContent;
  Footer: typeof GlassCardFooter;
};

export const GlassCard = GlassCardRoot as GlassCardComponent;

GlassCard.Header = GlassCardHeader;
GlassCard.Title = GlassCardTitle;
GlassCard.Description = GlassCardDescription;
GlassCard.Content = GlassCardContent;
GlassCard.Footer = GlassCardFooter;

export default GlassCard;
