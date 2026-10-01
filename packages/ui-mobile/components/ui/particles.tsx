// components/ui/particles.tsx (NOUVEAU - pour réutiliser les particules)

import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ParticlesProps {
  count?: number;
  color?: string;
  sizeRange?: [number, number];
  speedRange?: [number, number];
  opacityRange?: [number, number];
}

export const Particles: React.FC<ParticlesProps> = ({
  count = 30,
  color = "#D4A017",
  sizeRange = [1, 4],
  speedRange = [0.2, 0.7],
  opacityRange = [0.1, 0.5],
}) => {
  const particles = useRef<
    Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
      speed: Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0],
      opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
    }));
  }, [count]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.current.map((p, i) => {
        const y = useSharedValue(p.y);

        useEffect(() => {
          const animateParticle = () => {
            y.value = withTiming((y.value + p.speed * 2) % SCREEN_HEIGHT, {
              duration: 3000 + Math.random() * 2000,
              easing: Easing.linear,
            }, () => {
              runOnJS(animateParticle)();
            });
          };
          animateParticle();
        }, []);

        const style = useAnimatedStyle(() => ({
          transform: [{ translateY: y.value }],
          opacity: p.opacity,
        }));

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                left: p.x,
                borderRadius: p.size / 2,
                backgroundColor: color,
              },
              style,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
  },
});