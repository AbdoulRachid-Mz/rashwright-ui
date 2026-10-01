// @/components/ui/fab-menu.tsx
//
// Menu d'actions flottantes (Speed Dial / FAB Menu) avec sous-actions animées en éventail.

import React, { useState, ReactNode } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";
import FloatingActionButton, { FABPosition } from "./floating-action-button";

export interface FabMenuItem {
  id?: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}

export interface FabMenuProps {
  items: FabMenuItem[];
  mainIcon?: ReactNode;
  activeIcon?: ReactNode;
  position?: FABPosition;
  offset?: { x?: number; y?: number };
  style?: StyleProp<ViewStyle>;
}

export const FabMenu: React.FC<FabMenuProps> = ({
  items,
  mainIcon = <Ionicons name="add" size={26} color="#FFFFFF" />,
  activeIcon = <Ionicons name="close" size={26} color="#FFFFFF" />,
  position = "bottom-right",
  offset,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const animProgress = useSharedValue(0);

  const toggle = () => {
    const nextState = !open;
    setOpen(nextState);
    animProgress.value = withSpring(nextState ? 1 : 0, {
      damping: 18,
      stiffness: 240,
    });
  };

  const handleItemPress = (item: FabMenuItem) => {
    toggle();
    item.onPress();
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value,
  }));

  const bottomBase = (offset?.y ?? 20) + Math.max(insets.bottom, 16);
  const rightBase = (offset?.x ?? 20) + Math.max(insets.right, 16);

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <TouchableWithoutFeedback onPress={toggle}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              overlayAnimatedStyle,
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Floating Menu Stack */}
      <View
        pointerEvents="box-none"
        style={[
          styles.container,
          {
            bottom: bottomBase + 64,
            right: rightBase,
          },
          style,
        ]}
      >
        {items.map((item, index) => {
          const itemAnimatedStyle = useAnimatedStyle(() => {
            const translateY = (1 - animProgress.value) * (40 * (items.length - index));
            return {
              opacity: animProgress.value,
              transform: [{ translateY }, { scale: animProgress.value }],
            };
          });

          return (
            <Animated.View
              key={item.id || index}
              style={[styles.itemRow, itemAnimatedStyle]}
            >
              <LiquidSurface
                material="thick"
                borderRadius={theme.borderRadius.md}
                style={styles.labelSurface}
              >
                <ThemedText variant="sm" weight="semibold">
                  {item.label}
                </ThemedText>
              </LiquidSurface>

              <LiquidPressable
                onPress={() => handleItemPress(item)}
                viscosity="medium"
                style={[
                  styles.itemBtn,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                {item.icon}
              </LiquidPressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Primary Trigger Button */}
      <FloatingActionButton
        icon={open ? activeIcon : mainIcon}
        onPress={toggle}
        position={position}
        offset={offset}
        glow={!open}
      />
    </>
  );
};

export default FabMenu;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 998,
  },
  container: {
    position: "absolute",
    alignItems: "flex-end",
    gap: 12,
    zIndex: 999,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  labelSurface: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  itemBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
