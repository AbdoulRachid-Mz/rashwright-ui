// @/components/ui/dot.tsx

import { useTheme } from "@/contexts/theme-context";
import { StyleSheet, View, ViewStyle } from "react-native";

interface DotProps {
  style?: ViewStyle;
  color?: string;
  size?: number;
  colorKey?: string;
}

export default function Dot({
  style,
  color,
  size = 8,
  colorKey = "primary",
}: DotProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor:
            color ||
            theme.colors[colorKey as keyof typeof theme.colors] ||
            theme.colors.primary,
          height: size,
          width: size,
          ...style,
        },
      ]}
    />
  );
}
// styles
const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
