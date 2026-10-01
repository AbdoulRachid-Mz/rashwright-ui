// @/components/ui/confirm.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import Button from "./button";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidPressable from "./liquid/liquid-pressable";

// Confirmation types
export type ConfirmType = "dialog" | "drawer" | "alert";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => void;
  hideConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const translateY = useSharedValue(SCREEN_HEIGHT * 0.4);

  const showConfirm = useCallback((newOptions: ConfirmOptions) => {
    setOptions({
      ...newOptions,
      type: newOptions.type || "dialog",
      confirmText: newOptions.confirmText || "Confirmer",
      cancelText: newOptions.cancelText || "Annuler",
    });
    setVisible(true);

    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withSpring(1, { damping: 18, stiffness: 280 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 250 });
  }, []);

  const hideConfirm = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180 });
    scale.value = withTiming(0.92, { duration: 180 });
    translateY.value = withTiming(SCREEN_HEIGHT * 0.4, { duration: 180 });

    setTimeout(() => {
      setVisible(false);
      setOptions(null);
    }, 180);
  }, []);

  const handleConfirm = useCallback(() => {
    if (options?.onConfirm) {
      options.onConfirm();
    }
    hideConfirm();
  }, [options, hideConfirm]);

  const handleCancel = useCallback(() => {
    if (options?.onCancel) {
      options.onCancel();
    }
    hideConfirm();
  }, [options, hideConfirm]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const renderAlert = () => (
    <Animated.View style={[styles.alertContainer, dialogAnimatedStyle]}>
      <LiquidSurface material="thick" borderRadius={theme.borderRadius.xl} style={styles.contentPadding}>
        <ThemedText variant="lg" weight="bold" style={styles.titleText}>
          {options?.title}
        </ThemedText>
        {options?.message && (
          <ThemedText variant="sm" color="mutedForeground" style={styles.messageText}>
            {options.message}
          </ThemedText>
        )}
        <View style={styles.alertButtons}>
          <Button variant="outline" size="md" style={styles.flex1} onPress={handleCancel}>
            {options?.cancelText}
          </Button>
          <Button
            variant={options?.isDestructive ? "destructive" : "default"}
            size="md"
            style={styles.flex1}
            onPress={handleConfirm}
          >
            {options?.confirmText}
          </Button>
        </View>
      </LiquidSurface>
    </Animated.View>
  );

  const renderDialog = () => (
    <Animated.View style={[styles.dialogContainer, dialogAnimatedStyle]}>
      <LiquidSurface material="thick" borderRadius={theme.borderRadius.xl} style={styles.dialogInner}>
        <View style={styles.dialogTextContainer}>
          <ThemedText variant="lg" weight="bold" style={styles.titleText}>
            {options?.title}
          </ThemedText>
          {options?.message && (
            <ThemedText variant="sm" color="mutedForeground" style={styles.messageText}>
              {options.message}
            </ThemedText>
          )}
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.dialogButtons}>
          <LiquidPressable style={styles.dialogBtn} onPress={handleCancel}>
            <ThemedText variant="base" weight="medium">
              {options?.cancelText}
            </ThemedText>
          </LiquidPressable>
          <View style={[styles.vDivider, { backgroundColor: theme.colors.border }]} />
          <LiquidPressable style={styles.dialogBtn} onPress={handleConfirm}>
            <ThemedText
              variant="base"
              weight="bold"
              color={options?.isDestructive ? "destructive" : "primary"}
            >
              {options?.confirmText}
            </ThemedText>
          </LiquidPressable>
        </View>
      </LiquidSurface>
    </Animated.View>
  );

  const renderDrawer = () => (
    <Animated.View style={[styles.drawerContainer, drawerAnimatedStyle]}>
      <LiquidSurface
        material="thick"
        borderRadius={theme.borderRadius["2xl"]}
        style={[
          styles.drawerSurface,
          {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
          },
        ]}
      >
        <View
          style={[
            styles.drawerHandle,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.25)"
                : "rgba(0, 0, 0, 0.2)",
            },
          ]}
        />
        <ThemedText variant="xl" weight="bold" style={styles.drawerTitleText}>
          {options?.title}
        </ThemedText>
        {options?.message && (
          <ThemedText variant="sm" color="mutedForeground" style={styles.drawerMessageText}>
            {options.message}
          </ThemedText>
        )}
        <View style={styles.drawerActions}>
          <Button
            variant={options?.isDestructive ? "destructive" : "default"}
            size="lg"
            isFullWidth
            onPress={handleConfirm}
          >
            {options?.confirmText}
          </Button>
          <Button variant="secondary" size="lg" isFullWidth onPress={handleCancel}>
            {options?.cancelText}
          </Button>
        </View>
      </LiquidSurface>
    </Animated.View>
  );

  const renderContent = () => {
    switch (options?.type) {
      case "alert":
        return renderAlert();
      case "drawer":
        return renderDrawer();
      case "dialog":
      default:
        return renderDialog();
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      {visible && options && (
        <Modal
          visible={visible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={handleCancel}
        >
          <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
            {Platform.OS === "ios" && (
              <BlurView
                intensity={35}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View
              style={[
                styles.centeredContainer,
                options.type === "drawer" && styles.drawerWrapper,
              ]}
            >
              {renderContent()}
            </View>
          </Animated.View>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  drawerWrapper: {
    justifyContent: "flex-end",
    padding: 0,
  },
  alertContainer: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
  },
  dialogContainer: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
  },
  drawerContainer: {
    width: "100%",
  },
  drawerSurface: {
    padding: 20,
  },
  contentPadding: {
    padding: 20,
  },
  dialogInner: {
    overflow: "hidden",
  },
  dialogTextContainer: {
    padding: 20,
  },
  titleText: {
    textAlign: "center",
    marginBottom: 8,
  },
  messageText: {
    textAlign: "center",
    lineHeight: 20,
  },
  drawerTitleText: {
    textAlign: "center",
    marginBottom: 8,
  },
  drawerMessageText: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  vDivider: {
    width: 1,
    height: "100%",
  },
  alertButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  dialogButtons: {
    flexDirection: "row",
    height: 48,
  },
  dialogBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerActions: {
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
});
