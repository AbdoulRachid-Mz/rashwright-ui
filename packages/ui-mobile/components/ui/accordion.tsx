// @/components/ui/accordion.tsx
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  /** Identifiants des sections ouvertes (mode contrôlé) */
  value?: string[];
  /** Valeur par défaut pour le mode non contrôlé */
  defaultValue?: string[];
  /** Alias rétrocompatible pour defaultValue */
  defaultOpen?: string[];
  /** Callback déclenché lors du changement d'onglets ouverts */
  onValueChange?: (value: string[]) => void;
  variant?: "default" | "bordered" | "glass";
  style?: StyleProp<ViewStyle>;
}

// ─── AccordionItemView ────────────────────────────────────────────────────────

interface AccordionItemViewProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
  variant: "default" | "bordered" | "glass";
}

const AccordionItemView: React.FC<AccordionItemViewProps> = ({
  item,
  isOpen,
  onToggle,
  variant,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const contentHeight = useRef<number>(0);
  const animatedHeight = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const measured = e.nativeEvent.layout.height;
      if (measured > 0 && contentHeight.current !== measured) {
        contentHeight.current = measured;
        if (isOpen) {
          animatedHeight.value = measured;
        }
      }
    },
    [isOpen, animatedHeight],
  );

  React.useEffect(() => {
    if (isOpen) {
      animatedHeight.value = withTiming(contentHeight.current, {
        duration: 250,
      });
      chevronRotation.value = withTiming(1, { duration: 250 });
    } else {
      animatedHeight.value = withTiming(0, { duration: 250 });
      chevronRotation.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, animatedHeight, chevronRotation]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const handlePress = useCallback(() => {
    if (item.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id);
  }, [item.disabled, item.id, onToggle]);

  const useGlass =
    variant === "glass" && liquidGlassEnabled;

  const glassTheme = useGlass
    ? createGlassTheme(theme, isDark)
    : null;

  const containerStyle: ViewStyle = {
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    opacity: item.disabled ? 0.5 : 1,
    ...(variant === "bordered"
      ? {
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      : {}),
    ...(useGlass && glassTheme
      ? {
          backgroundColor: glassTheme.materials.soft.background,
          borderWidth: 1,
          borderColor: glassTheme.border.subtle,
        }
      : variant === "default"
        ? { backgroundColor: theme.colors.card }
        : {}),
  };

  const headerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  };

  return (
    <View style={containerStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          headerStyle,
          pressed && !item.disabled && { opacity: 0.75 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityState={{ expanded: isOpen, disabled: item.disabled }}
        disabled={item.disabled}
      >
        {item.icon && <View>{item.icon}</View>}
        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.foreground, flex: 1 },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Animated.View style={animatedChevronStyle}>
          <Text
            style={{ color: theme.colors.mutedForeground, fontSize: 14 }}
            accessibilityElementsHidden
          >
            ▼
          </Text>
        </Animated.View>
      </Pressable>

      <Animated.View style={animatedContentStyle}>
        <View
          onLayout={handleLayout}
          style={{
            position: contentHeight.current === 0 ? "absolute" : "relative",
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          }}
        >
          {item.content}
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Accordion ────────────────────────────────────────────────────────────────

export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  value: valueProp,
  defaultValue,
  defaultOpen,
  onValueChange,
  variant = "default",
  style,
}) => {
  const isControlled = valueProp !== undefined;
  const initialOpen = valueProp ?? defaultValue ?? defaultOpen ?? [];
  const [internalOpen, setInternalOpen] = useState<string[]>(initialOpen);

  const activeIds = isControlled ? (valueProp ?? []) : internalOpen;
  const openSet = new Set(activeIds);

  const handleToggle = useCallback(
    (id: string) => {
      let next: string[];
      if (openSet.has(id)) {
        next = activeIds.filter((item) => item !== id);
      } else {
        next = multiple ? [...activeIds, id] : [id];
      }

      if (!isControlled) {
        setInternalOpen(next);
      }
      onValueChange?.(next);
    },
    [activeIds, isControlled, multiple, onValueChange, openSet],
  );

  return (
    <View style={style} accessibilityRole="list">
      {items.map((item) => (
        <AccordionItemView
          key={item.id}
          item={item}
          isOpen={openSet.has(item.id)}
          onToggle={handleToggle}
          variant={variant}
        />
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default Accordion;
