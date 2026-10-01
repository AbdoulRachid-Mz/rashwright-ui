import { useCallback, useRef } from "react";
import { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import { useTabBarContext } from "@/contexts/tab-bar-context";

/**
 * Hook pour masquer / afficher la tab bar lors du scroll.
 *
 * Résout définitivement le problème où les tabs restent figées :
 * 1. Proche du haut (y <= 60) : toujours visible.
 * 2. Scroll vers le bas avec y > 80 : cache la tab bar.
 * 3. Scroll vers le haut (même minime, diff < -6) : réaffiche immédiatement la tab bar.
 * 4. Défilement arrêté proche du haut : garantit la visibilité.
 */
export function useScrollAwareTabBar() {
  const { notifyScroll, tabBarHidden } = useTabBarContext();

  // Pour Reanimated worklet (UI thread)
  const lastOffsetY = useSharedValue(0);

  // Pour le mode legacy JS
  const lastOffsetLegacy = useRef(0);

  /**
   * Handler Reanimated à utiliser avec <Animated.ScrollView onScroll={scrollHandler} />
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: any) => {
      "worklet";
      const currentY = event.contentOffset.y;
      const diff = currentY - lastOffsetY.value;

      // 1. En haut de page : toujours visible
      if (currentY <= 60) {
        if (tabBarHidden.value !== 0) {
          notifyScroll(false);
        }
        lastOffsetY.value = currentY;
        return;
      }

      // Ignorer les micro-variations
      if (Math.abs(diff) < 6) {
        return;
      }

      // 2. Scroll vers le bas et on a dépassé le seuil
      if (diff > 6 && currentY > 80) {
        if (tabBarHidden.value !== 1) {
          notifyScroll(true);
        }
      }
      // 3. Scroll vers le haut : réafficher immédiatement
      else if (diff < -6) {
        if (tabBarHidden.value !== 0) {
          notifyScroll(false);
        }
      }

      lastOffsetY.value = currentY;
    },
    onEndDrag: (event: any) => {
      "worklet";
      if (event.contentOffset.y <= 80 && tabBarHidden.value !== 0) {
        notifyScroll(false);
      }
    },
    onMomentumEnd: (event: any) => {
      "worklet";
      if (event.contentOffset.y <= 80 && tabBarHidden.value !== 0) {
        notifyScroll(false);
      }
    },
  });

  /**
   * Handler compatible ScrollView / FlatList standard (thread JS).
   */
  const onScrollLegacy = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastOffsetLegacy.current;

      // 1. En haut de page : toujours visible
      if (currentY <= 60) {
        if (tabBarHidden.value !== 0) {
          notifyScroll(false);
        }
        lastOffsetLegacy.current = currentY;
        return;
      }

      // Ignorer les micro-variations
      if (Math.abs(diff) < 6) {
        return;
      }

      // 2. Scroll vers le bas et on a dépassé le seuil
      if (diff > 6 && currentY > 80) {
        if (tabBarHidden.value !== 1) {
          notifyScroll(true);
        }
      }
      // 3. Scroll vers le haut : réafficher immédiatement
      else if (diff < -6) {
        if (tabBarHidden.value !== 0) {
          notifyScroll(false);
        }
      }

      lastOffsetLegacy.current = currentY;
    },
    [notifyScroll, tabBarHidden]
  );

  return {
    scrollHandler,
    onScroll: onScrollLegacy,
    onScrollLegacy,
  };
}
