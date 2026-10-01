// @/components/ui/video.tsx

import React, {
  forwardRef,
  useEffect,
  useMemo,
} from "react";
import {
  StyleProp,
  ViewStyle,
} from "react-native";
import {
  VideoView,
  VideoViewProps,
  VideoSource,
  useVideoPlayer,
} from "expo-video";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../../contexts/theme-context";

export interface ThemedVideoProps
  extends Omit<VideoViewProps, "player"> {
  /**
   * URL distante ou source vidéo locale.
   */
  source: VideoSource;

  /**
   * Lance automatiquement la lecture
   * lorsque la première frame est disponible.
   */
  autoPlay?: boolean;

  /**
   * Boucle de lecture.
   */
  loop?: boolean;

  /**
   * Animation d'apparition de la vidéo.
   */
  animated?: boolean;

  /**
   * Durée de l'animation d'apparition.
   */
  animationDuration?: number;

  /**
   * Style React Native.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Callback appelé une fois que le player
   * est créé.
   */
  onPlayerReady?: (player: ReturnType<typeof useVideoPlayer>) => void;
}

const AnimatedVideoView =
  Animated.createAnimatedComponent(VideoView);

const ThemedVideo = forwardRef<any, ThemedVideoProps>(
  (
    {
      source,
      autoPlay = false,
      loop = false,
      animated = true,
      animationDuration = 300,
      style,
      onPlayerReady,
      onFirstFrameRender,
      ...props
    },
    ref,
  ) => {
    const { isDark } = useTheme();

    const opacity = useSharedValue(animated ? 0 : 1);

    const player = useVideoPlayer(
      source,
      (videoPlayer: any) => {
        videoPlayer.loop = loop;
      },
    );

    useEffect(() => {
      onPlayerReady?.(player);
    }, [player, onPlayerReady]);

    const handleFirstFrameRender = () => {
      if (animated) {
        opacity.value = withTiming(
          1,
          {
            duration: animationDuration,
            easing: Easing.out(Easing.quad),
          },
        );
      } else {
        opacity.value = 1;
      }

      onFirstFrameRender?.();
    };

    useEffect(() => {
      player.loop = loop;
    }, [player, loop]);

    useEffect(() => {
      if (!autoPlay) {
        player.pause();
        return;
      }

      player.play();
    }, [player, autoPlay]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const fallbackStyle = useMemo<ViewStyle>(
      () => ({
        backgroundColor: isDark
          ? "#020617"
          : "#000000",
      }),
      [isDark],
    );

    return (
      <AnimatedVideoView
        ref={ref}
        player={player}
        style={[
          fallbackStyle,
          style,
          animatedStyle,
        ]}
        onFirstFrameRender={handleFirstFrameRender}
        {...props}
      />
    );
  },
);

ThemedVideo.displayName = "Video";

export default ThemedVideo;