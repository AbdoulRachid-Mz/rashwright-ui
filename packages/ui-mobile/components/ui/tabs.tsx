// @/components/ui/tabs.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidHighlight from "./liquid/liquid-highlight";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabs: string[];
  registerTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
};

// Tabs Root Component
export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  style,
}: TabsProps) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const [tabs, setTabs] = useState<string[]>([]);

  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalTab(newValue);
    }
  };

  const registerTab = (tabValue: string) => {
    setTabs((prev) => {
      if (prev.indexOf(tabValue) === -1) {
        return [...prev, tabValue];
      }
      return prev;
    });
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, tabs, registerTab }}
    >
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

// TabsList Component
export interface TabsListProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const TabsList = ({ children, style }: TabsListProps) => {
  const { theme } = useTheme();

  return (
    <LiquidSurface
      material="soft"
      borderRadius={theme.borderRadius.full}
      style={[styles.tabsList, style]}
    >
      <View style={styles.tabsListInner}>{children}</View>
    </LiquidSurface>
  );
};

// TabsTrigger Component
export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const TabsTrigger = ({
  value,
  children,
  disabled = false,
  style,
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab, registerTab } = useTabs();
  const { theme, isDark } = useTheme();
  const isActive = activeTab === value;

  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    registerTab(value);
  }, [value]);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, {
      damping: 18,
      stiffness: 240,
    });
  }, [isActive]);

  const handlePress = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.95 + progress.value * 0.05 }],
  }));

  return (
    <LiquidPressable
      onPress={handlePress}
      disabled={disabled}
      viscosity="soft"
      style={[styles.tabTrigger, disabled && { opacity: 0.4 }, style]}
    >
      {/* Active Glass Capsule Indicator */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeCapsule,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.95)",
            borderRadius: theme.borderRadius.full,
            shadowColor: isDark ? "#000" : "rgba(15, 23, 42, 0.08)",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 3,
          },
          indicatorAnimatedStyle,
        ]}
      >
        <LiquidHighlight type="top" borderRadius={theme.borderRadius.full} opacity={0.5} />
      </Animated.View>

      {typeof children === "string" || typeof children === "number" ? (
        <ThemedText
          variant="sm"
          weight={isActive ? "semibold" : "medium"}
          color={isActive ? "foreground" : "mutedForeground"}
          style={styles.triggerText}
        >
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </LiquidPressable>
  );
};

// TabsContent Component
export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const TabsContent = ({
  value,
  children,
  style,
}: TabsContentProps) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return <View style={[styles.tabsContent, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  tabsList: {
    alignSelf: "stretch",
    padding: 4,
  },
  tabsListInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabTrigger: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: "relative",
    zIndex: 1,
  },
  activeCapsule: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 2,
    bottom: 0,
    zIndex: -1,
  },
  triggerText: {
    textAlign: "center",
  },
  tabsContent: {
    flex: 1,
    paddingTop: 12,
  },
});
