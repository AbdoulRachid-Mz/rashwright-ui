// @/components/ui/tabs.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
};

// ── Tabs Root Component ──────────────────────────────────────────────────────
export interface TabsProps {
  /** Valeur par défaut pour le mode non contrôlé */
  defaultValue?: string;
  /** Valeur active pour le mode contrôlé */
  value?: string;
  /** Callback appelé au changement d'onglet */
  onValueChange?: (value: string) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Tabs = ({
  defaultValue = "",
  value,
  onValueChange,
  children,
  style,
}: TabsProps) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalTab;

  const setActiveTab = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalTab(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={[styles.tabsRoot, style]}>{children}</View>
    </TabsContext.Provider>
  );
};

// ── TabsList Component ───────────────────────────────────────────────────────
export interface TabsListProps {
  children: ReactNode;
  /** Si true, permet le défilement horizontal lorsque les onglets dépassent */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TabsList = ({
  children,
  scrollable = false,
  style,
}: TabsListProps) => {
  const { theme, isDark } = useTheme();

  const content = (
    <View style={[styles.tabsListInner, scrollable && styles.tabsListInnerScrollable]}>
      {children}
    </View>
  );

  return (
    <LiquidSurface
      material="soft"
      borderRadius={theme.borderRadius.full}
      style={[
        styles.tabsListSurface,
        {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.06)"
            : "rgba(0, 0, 0, 0.04)",
        },
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </LiquidSurface>
  );
};

// ── TabsTrigger Component ────────────────────────────────────────────────────
export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  /** Label accessible vocal (recommandé si l'enfant est une icône) */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const TabsTrigger = ({
  value,
  children,
  disabled = false,
  accessibilityLabel,
  style,
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabs();
  const { theme, isDark } = useTheme();
  const isActive = activeTab === value;

  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, {
      damping: 20,
      stiffness: 280,
    });
  }, [isActive]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      setActiveTab(value);
    }
  }, [disabled, setActiveTab, value]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  const label =
    accessibilityLabel ||
    (typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined);

  return (
    <LiquidPressable
      onPress={handlePress}
      disabled={disabled}
      viscosity="soft"
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled }}
      accessibilityLabel={label}
      style={[
        styles.tabTrigger,
        disabled && styles.tabTriggerDisabled,
        style,
      ]}
    >
      {/* Capsule d'arrière-plan animé sans zIndex négatif (évite clipping Android/iOS) */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.activeCapsule,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.16)"
              : "rgba(255, 255, 255, 0.95)",
            borderRadius: theme.borderRadius.full,
            shadowColor: isDark ? "#000" : "rgba(15, 23, 42, 0.1)",
            shadowOffset: { width: 0, height: 1.5 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 2,
          },
          indicatorAnimatedStyle,
        ]}
      />

      <View style={styles.triggerContent}>
        {typeof children === "string" || typeof children === "number" ? (
          <ThemedText
            variant="sm"
            weight={isActive ? "semibold" : "medium"}
            color={isActive ? "foreground" : "mutedForeground"}
            style={styles.triggerText}
            numberOfLines={1}
          >
            {children}
          </ThemedText>
        ) : (
          children
        )}
      </View>
    </LiquidPressable>
  );
};

// ── TabsContent Component ────────────────────────────────────────────────────
export interface TabsContentProps {
  value: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const TabsContent = ({ value, children, style }: TabsContentProps) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <View
      accessibilityRole="summary"
      style={[styles.tabsContent, style]}
    >
      {children}
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  tabsRoot: {
    width: "100%",
  },
  tabsListSurface: {
    alignSelf: "stretch",
    padding: 3,
    overflow: "hidden",
  },
  tabsListInner: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  tabsListInnerScrollable: {
    width: "auto",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  tabTrigger: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    position: "relative",
    overflow: "hidden",
  },
  tabTriggerDisabled: {
    opacity: 0.45,
  },
  activeCapsule: {
    margin: 1,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  triggerText: {
    textAlign: "center",
  },
  tabsContent: {
    width: "100%",
    paddingTop: 12,
  },
});
