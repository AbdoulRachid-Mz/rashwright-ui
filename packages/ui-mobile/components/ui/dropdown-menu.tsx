// @/components/ui/dropdown-menu.tsx
//
// Menu contextuel déroulant Liquid Glass avec items interactifs et support d'icônes.

import React, { useState, ReactNode } from "react";
import {
  View,
  StyleSheet,
  Modal,
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
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";

export interface DropdownMenuItem {
  id?: string;
  label: string;
  icon?: string | ReactNode;
  variant?: "default" | "destructive";
  onPress: () => void;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  style?: StyleProp<ViewStyle>;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = "right",
  style,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const openMenu = () => {
    setVisible(true);
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSpring(1, { damping: 18, stiffness: 280 });
  };

  const closeMenu = () => {
    opacity.value = withTiming(0, { duration: 140 });
    scale.value = withTiming(0.9, { duration: 140 });
    setTimeout(() => setVisible(false), 140);
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      closeMenu();
      item.onPress();
    }
  };

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <LiquidPressable onPress={openMenu} viscosity="soft">
        {trigger}
      </LiquidPressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.menuWrapper,
                  align === "right" ? styles.alignRight : styles.alignLeft,
                  menuAnimatedStyle,
                ]}
              >
                <LiquidSurface
                  material="thick"
                  borderRadius={theme.borderRadius.md}
                  style={styles.menuSurface}
                >
                  {items.map((item, index) => {
                    const isDestructive = item.variant === "destructive";
                    return (
                      <LiquidPressable
                        key={item.id || index}
                        onPress={() => handleItemPress(item)}
                        disabled={item.disabled}
                        viscosity="soft"
                        style={[
                          styles.menuItem,
                          item.disabled && styles.disabledItem,
                        ]}
                      >
                        {typeof item.icon === "string" ? (
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={
                              isDestructive
                                ? theme.colors.destructive
                                : theme.colors.foreground
                            }
                          />
                        ) : (
                          item.icon
                        )}
                        <ThemedText
                          variant="sm"
                          weight="medium"
                          color={isDestructive ? "destructive" : "foreground"}
                          style={styles.itemLabel}
                        >
                          {item.label}
                        </ThemedText>
                      </LiquidPressable>
                    );
                  })}
                </LiquidSurface>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default DropdownMenu;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menuWrapper: {
    width: 220,
  },
  alignRight: {
    alignSelf: "flex-end",
  },
  alignLeft: {
    alignSelf: "flex-start",
  },
  menuSurface: {
    padding: 6,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 10,
  },
  disabledItem: {
    opacity: 0.4,
  },
  itemLabel: {
    flex: 1,
  },
});
