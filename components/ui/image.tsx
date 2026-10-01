
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


interface ThemedImageProps extends ImageProps {
  className?: string;
  style?: ImageStyle;
  animated?: boolean;
  animationDuration?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

const ThemedImage = forwardRef<any, ThemedImageProps>(
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

    const handleLoad = (e: any) => {
      if (animated) {
        opacity.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
        });
      } else {
        opacity.value = 1;
      }
      (props as any).onLoad?.(e);
    };

    const handleError = (e: any) => {
      // S'assurer que l'image s'affiche (ou son placeholder/fallback) même en cas d'erreur
      opacity.value = 1;
      (props as any).onError?.(e);
    };

    const handleLoadEnd = () => {
      opacity.value = 1;
      (props as any).onLoadEnd?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <AnimatedImage
        ref={ref}
        style={[style, animatedStyle]}
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

