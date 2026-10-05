// @/components/ui/drawer.tsx
import React, { ReactNode, forwardRef, useEffect, useMemo } from "react";
import {
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/theme-context";
import LiquidSurface from "./liquid/liquid-surface";

export interface DrawerProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  noBlur?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Drawer = forwardRef<React.ElementRef<typeof RNModal>, DrawerProps>(
  ({ children, visible, onClose, style, noBlur = false }, ref) => {
    const { theme, isDark } = useTheme();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT * 0.6);

    useEffect(() => {
      if (visible) {
        opacity.value = withTiming(1, { duration: 250 });
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 250,
          mass: 0.8,
        });
      } else {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(SCREEN_HEIGHT * 0.6, {
          duration: 220,
          easing: Easing.in(Easing.quad),
        });
      }
    }, [visible]);

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const styles = useMemo(
      () =>
        StyleSheet.create({
          overlay: {
            flex: 1,
            backgroundColor: isDark
              ? "rgba(2, 6, 23, 0.7)"
              : "rgba(15, 23, 42, 0.45)",
            justifyContent: "flex-end",
          },
          sheetContainer: {
            width: "100%",
            maxHeight: "90%",
          },
          handle: {
            width: 44,
            height: 5,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.25)"
              : "rgba(0, 0, 0, 0.2)",
            borderRadius: 3,
            alignSelf: "center",
            marginTop: 12,
            marginBottom: 10,
          },
          contentInner: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
          },
        }),
      [theme, isDark]
    );

    return (
      <RNModal
        ref={ref}
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
            {!noBlur && Platform.OS === "ios" && (
              <BlurView
                intensity={40}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            )}
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.sheetContainer, contentAnimatedStyle]}
              >
                <LiquidSurface
                  material="thick"
                  borderRadius={theme.borderRadius["2xl"]}
                  style={[
                    {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                    style,
                  ]}
                >
                  <View style={styles.handle} />
                  <View style={styles.contentInner}>{children}</View>
                </LiquidSurface>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }
);

Drawer.displayName = "Drawer";

export default Drawer;
