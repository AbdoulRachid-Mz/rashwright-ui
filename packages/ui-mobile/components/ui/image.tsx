
// @/components/ui/image.tsx
import { Image as ExpoImage, ImageProps, ImageStyle } from "expo-image";
import { useTheme } from "@/contexts/theme-context";
import { ReactNode, forwardRef, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";


import type { StyleProp } from "react-native";
interface ThemedImageProps extends ImageProps {
  className?: string;
  style?: StyleProp<ImageStyle>;
  animated?: boolean;
  animationDuration?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

const ThemedImage = forwardRef<unknown, ThemedImageProps>(
  (
    {
      style,
      animated = true,
      animationDuration = 300,
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme();
    const opacity = useSharedValue(animated ? 0 : 1);

    const handleLoad = (e: unknown) => {
      if (animated) {
        opacity.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
        });
      } else {
        opacity.value = 1;
      }
      (props.onLoad as ((...args: unknown[]) => void) | undefined)?.(e);
    };

    const handleError = (e: unknown) => {
      // S"assurer que l'image s'affiche (ou son placeholder/fallback) même en cas d'erreur
      opacity.value = 1;
      (props.onError as ((...args: unknown[]) => void) | undefined)?.(e);
    };

    const handleLoadEnd = () => {
      opacity.value = 1;
      (props.onLoadEnd as (() => void) | undefined)?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const combinedStyle = [style, animatedStyle] as unknown;

    return (
      <AnimatedImage
        ref={ref}
        style={combinedStyle as StyleProp<ImageStyle>}
        onLoad={handleLoad}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        {...props}
      />
    );
  }
);

ThemedImage.displayName = "Image";

export default ThemedImage;

