// @/components/ui/card.tsx
import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
  StyleProp,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";
import type { LiquidMaterial } from "./liquid/liquid-types";

// Card Context to maintain composition pattern
interface CardContextType {
  theme: ReturnType<typeof useTheme>["theme"];
  isDark: boolean;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error(
      "Card compound components must be used within a Card parent component"
    );
  }
  return context;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  variant?: "default" | "outline" | "glass" | string;
  onPress?: TouchableOpacityProps["onPress"];
  disabled?: boolean;
  activeOpacity?: number;
  animateEntry?: boolean;
  entryDelay?: number;
  material?: LiquidMaterial;
  noBlur?: boolean;
  testID?: string;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  accessibilityValue?: { min?: number; max?: number; now?: number; text?: string };
}

// Main Card Component
const CardRoot = ({
  children,
  style,
  className,
  variant,
  onPress,
  disabled = false,
  activeOpacity = 0.8,
  animateEntry = true,
  entryDelay = 0,
  material = "regular",
  noBlur = false,
  testID,
  accessibilityRole,
  accessibilityLabel,
  accessibilityValue,
}: CardProps) => {
  const { theme, isDark } = useTheme();
  const effectiveMaterial = variant === "glass" ? ("glass" as LiquidMaterial) : material;
  const effectiveNoBlur = variant === "glass" ? false : noBlur;

  // Animation values for smooth entry and press interactions
  const progress = useSharedValue(animateEntry ? 0 : 1);
  const scale = useSharedValue(1);

  // Trigger entrance animation safely in useEffect (no side-effects in render)
  useEffect(() => {
    if (animateEntry) {
      const timer = setTimeout(() => {
        progress.value = withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }, entryDelay);
      return () => clearTimeout(timer);
    } else {
      progress.value = 1;
    }
  }, [animateEntry, entryDelay]);

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [15, 0]);
    const opacity = progress.value;

    return {
      opacity,
      transform: [{ translateY }, { scale: scale.value }],
    };
  });

  const Container = onPress ? AnimatedTouchableOpacity : AnimatedView;
  const containerProps = onPress
    ? {
        testID,
        onPress,
        disabled,
        activeOpacity,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        accessibilityRole: (accessibilityRole || "button") as any,
        accessibilityLabel,
        accessibilityValue,
        accessibilityState: { disabled },
      }
    : {
        testID,
        accessibilityRole: (accessibilityRole || "none") as any,
        accessibilityLabel,
        accessibilityValue,
      };

  return (
    <CardContext.Provider value={{ theme, isDark }}>
      <Animated.View style={animatedStyle} className={className}>
        <LiquidSurface
          material={effectiveMaterial}
          noBlur={effectiveNoBlur}
          borderRadius={theme.borderRadius.lg}
          style={[styles.container, style]}
        >
          <Container {...containerProps} style={styles.innerContainer}>
            {children}
          </Container>
        </LiquidSurface>
      </Animated.View>
    </CardContext.Provider>
  );
};

// Card Header Component
export interface CardHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const CardHeader = ({ children, style, className }: CardHeaderProps) => {
  const { theme } = useCardContext();

  return (
    <View
      className={className}
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

// Card Title Component
export interface CardTitleProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
}

const CardTitle = ({ children, style, className }: CardTitleProps) => {
  const { theme } = useCardContext();

  return (
    <ThemedText
      className={className}
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

// Card Description Component
export interface CardDescriptionProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
}

const CardDescription = ({ children, style, className }: CardDescriptionProps) => {
  const { theme } = useCardContext();

  return (
    <ThemedText
      className={className}
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

// Card Content Component
export interface CardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const CardContent = ({ children, style, className }: CardContentProps) => {
  const { theme } = useCardContext();

  return (
    <View
      className={className}
      style={[
        styles.contentContainer,
        { paddingVertical: theme.spacing.xs },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Card Footer Component
export interface CardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const CardFooter = ({ children, style, className }: CardFooterProps) => {
  const { theme } = useCardContext();

  return (
    <View
      className={className}
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
  },
  innerContainer: {
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
  contentContainer: {},
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

type CardComponent = typeof CardRoot & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

const Card = CardRoot as CardComponent;

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
