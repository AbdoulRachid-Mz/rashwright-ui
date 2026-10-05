// @/components/ui/modal.tsx
import React, { ReactNode, forwardRef, useEffect, useMemo } from "react";
import {
  ModalProps,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/theme-context";
import LiquidSurface from "./liquid/liquid-surface";

export interface ThemedModalProps extends ModalProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  animationDuration?: number;
  dismissOnOverlayPress?: boolean;
  noBlur?: boolean;
}

const ThemedModal = forwardRef<React.ElementRef<typeof RNModal>, ThemedModalProps>(
  (
    {
      children,
      visible,
      onClose,
      animationDuration = 250,
      dismissOnOverlayPress = true,
      overlayStyle,
      style,
      noBlur = false,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.92);
    const translateY = useSharedValue(15);

    useEffect(() => {
      if (visible) {
        opacity.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
        });
        scale.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.back(1.2)),
        });
        translateY.value = withTiming(0, {
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
        });
      } else {
        opacity.value = withTiming(0, {
          duration: animationDuration * 0.75,
          easing: Easing.in(Easing.quad),
        });
        scale.value = withTiming(0.92, {
          duration: animationDuration * 0.75,
        });
        translateY.value = withTiming(15, {
          duration: animationDuration * 0.75,
        });
      }
    }, [visible, animationDuration]);

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    }));

    const styles = useMemo(
      () =>
        StyleSheet.create({
          overlay: {
            flex: 1,
            backgroundColor: isDark
              ? "rgba(2, 6, 23, 0.7)"
              : "rgba(15, 23, 42, 0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.lg,
          },
          content: {
            width: "100%",
            maxWidth: 480,
            maxHeight: "90%",
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
        {...props}
      >
        <TouchableWithoutFeedback
          onPress={dismissOnOverlayPress ? onClose : undefined}
        >
          <Animated.View
            style={[styles.overlay, overlayStyle, overlayAnimatedStyle]}
          >
            {!noBlur && Platform.OS === "ios" && (
              <BlurView
                intensity={40}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            )}
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.content, contentAnimatedStyle]}
              >
                <LiquidSurface
                  material="thick"
                  borderRadius={theme.borderRadius.xl}
                  style={style}
                >
                  {children}
                </LiquidSurface>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }
);

ThemedModal.displayName = "Modal";

export default ThemedModal;
