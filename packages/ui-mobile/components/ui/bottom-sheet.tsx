// @/components/ui/bottom-sheet.tsx
//
// BottomSheet avancé avec points d'ancrage (snap points), backdrop blur et surface Liquid Glass thick.

import React, { useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/theme-context";
import LiquidSurface from "./liquid/liquid-surface";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[]; // e.g. ["40%", "70%", "90%"]
  initialSnapIndex?: number;
  dismissOnBackdropPress?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = ["50%", "85%"],
  initialSnapIndex = 0,
  dismissOnBackdropPress = true,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const parseSnapPoint = (pt: string | number): number => {
    if (typeof pt === "number") return pt;
    if (pt.endsWith("%")) {
      const pct = parseFloat(pt) / 100;
      return SCREEN_HEIGHT * pct;
    }
    return parseFloat(pt) || SCREEN_HEIGHT * 0.5;
  };

  const parsedSnapHeights = useMemo(
    () => snapPoints.map(parseSnapPoint),
    [snapPoints]
  );

  const currentHeight = parsedSnapHeights[initialSnapIndex] || parsedSnapHeights[0];

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(SCREEN_HEIGHT - currentHeight, {
        damping: 22,
        stiffness: 240,
        mass: 0.8,
      });
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 180 });
    }
  }, [visible, currentHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_evt, gesture) => {
          if (gesture.dy > 0) {
            translateY.value = SCREEN_HEIGHT - currentHeight + gesture.dy;
          }
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dy > 120 || gesture.vy > 0.8) {
            onClose();
          } else {
            translateY.value = withSpring(SCREEN_HEIGHT - currentHeight, {
              damping: 20,
              stiffness: 250,
            });
          }
        },
      }),
    [currentHeight, onClose]
  );

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
          {Platform.OS === "ios" && (
            <BlurView
              intensity={40}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          )}

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheetWrapper,
                { height: currentHeight },
                sheetAnimatedStyle,
              ]}
            >
              <LiquidSurface
                material="thick"
                borderRadius={theme.borderRadius["2xl"]}
                style={[
                  styles.surface,
                  {
                    height: currentHeight,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    paddingBottom: Platform.OS === "ios" ? 34 : 24,
                  },
                  style,
                ]}
              >
                {/* Drag Handle */}
                <View {...panResponder.panHandlers} style={styles.handleContainer}>
                  <View
                    style={[
                      styles.handle,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.25)"
                          : "rgba(0, 0, 0, 0.2)",
                      },
                    ]}
                  />
                </View>

                {/* Content */}
                <View style={styles.content}>{children}</View>
              </LiquidSurface>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheetWrapper: {
    width: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  surface: {
    width: "100%",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
