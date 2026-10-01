// @/components/ui/avatar-group.tsx
//
// Groupe d'avatars empilés avec décalage visuel et badge de dépassement (+N).

import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../../contexts/theme-context";
import Avatar, { AvatarProps } from "./avatar";
import ThemedText from "./text";
import LiquidBorder from "./liquid/liquid-border";

export interface AvatarGroupUser {
  id?: string;
  name?: string;
  uri?: string | null;
}

export interface AvatarGroupProps {
  users: AvatarGroupUser[];
  max?: number;
  size?: AvatarProps["size"];
  style?: StyleProp<ViewStyle>;
}

const SIZE_NUM_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = "md",
  style,
}) => {
  const { theme, isDark } = useTheme();

  const pixelSize =
    typeof size === "number" ? size : SIZE_NUM_MAP[size] || 48;

  const overlapOffset = Math.round(pixelSize * 0.28);
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <View style={[styles.container, style]}>
      {visibleUsers.map((user, index) => (
        <View
          key={user.id || index}
          style={[
            styles.avatarWrapper,
            {
              marginLeft: index > 0 ? -overlapOffset : 0,
              zIndex: visibleUsers.length - index,
            },
          ]}
        >
          <Avatar
            uri={user.uri}
            name={user.name}
            size={pixelSize}
            style={styles.avatarItem}
          />
        </View>
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.moreBadge,
            {
              width: pixelSize,
              height: pixelSize,
              borderRadius: pixelSize / 2,
              marginLeft: -overlapOffset,
              backgroundColor: isDark
                ? "rgba(30, 41, 59, 0.9)"
                : "rgba(226, 232, 240, 0.95)",
              zIndex: 0,
            },
          ]}
        >
          <ThemedText
            variant="xs"
            weight="bold"
            color="foreground"
            style={{ fontSize: Math.max(10, Math.floor(pixelSize * 0.3)) }}
          >
            +{remainingCount}
          </ThemedText>
          <LiquidBorder variant="subtle" borderRadius={pixelSize / 2} />
        </View>
      )}
    </View>
  );
};

export default AvatarGroup;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarItem: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  moreBadge: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
});
