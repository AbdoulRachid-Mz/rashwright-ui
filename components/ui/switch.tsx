// @/components/ui/switch.tsx
import React, { forwardRef } from "react";
import { Switch as RNSwitch, SwitchProps } from "react-native";
import { useTheme } from "../../contexts/theme-context";

export interface ThemedSwitchProps extends SwitchProps {
  className?: string;
}

const ThemedSwitch = forwardRef<any, ThemedSwitchProps>(
  ({ ...props }, ref) => {
    const { theme, isDark } = useTheme();

    return (
      <RNSwitch
        ref={ref}
        trackColor={{
          false: isDark ? "rgba(255,255,255,0.15)" : theme.colors.border,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.card}
        ios_backgroundColor={isDark ? "rgba(255,255,255,0.15)" : theme.colors.border}
        {...props}
      />
    );
  }
);

ThemedSwitch.displayName = "Switch";

export default ThemedSwitch;
