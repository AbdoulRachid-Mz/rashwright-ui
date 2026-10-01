// @/components/ui/view.tsx
import { useTheme } from "@/contexts/theme-context";
import React, { forwardRef } from "react";
import {
  StyleProp,
  ViewStyle,
  View as RNView,
  ViewProps as RNViewProps,
} from "react-native";
import Animated from "react-native-reanimated";

export interface ThemedViewProps extends RNViewProps {
  children?: React.ReactNode;
  background?:
    | "background"
    | "card"
    | "secondary"
    | "muted"
    | "accent"
    | "transparent";
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const ThemedView = forwardRef<RNView, ThemedViewProps>(
  ({ children, background = "transparent", style, ...props }, ref) => {
    const { theme } = useTheme();

    const backgroundColor =
      background === "transparent"
        ? "transparent"
        : theme.colors[background];

    return (
      <Animated.View
        ref={ref as any}
        style={[
          { backgroundColor },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    );
  }
);

ThemedView.displayName = "View";

export default ThemedView;