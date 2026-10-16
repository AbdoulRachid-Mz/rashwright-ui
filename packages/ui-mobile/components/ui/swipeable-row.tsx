// @/components/ui/swipeable-row.tsx
import React, { useRef, useCallback } from "react";
import {
  Animated,
  PanResponder,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SwipeAction {
  label: string;
  icon?: string;
  color: string;
  textColor?: string;
  onPress: () => void;
  /** Largeur de l'action en pixels. Défaut : 80 */
  width?: number;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  /** Active ou désactive le swipe. Défaut : true */
  enabled?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTION_DEFAULT_WIDTH = 80;
const SNAP_THRESHOLD_RATIO = 0.4; // fraction de la largeur totale des actions

function getTotalWidth(actions: SwipeAction[] = []): number {
  return actions.reduce((acc, a) => acc + (a.width ?? ACTION_DEFAULT_WIDTH), 0);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  enabled = true,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const { theme } = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  /** Valeur courante non-animée, mise à jour via listener */
  const currentX = useRef(0);
  /** Offset de départ pour chaque geste (valeur ouverte précédente) */
  const startX = useRef(0);

  // Écoute la valeur courante sans re-render
  React.useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const totalLeftWidth = getTotalWidth(leftActions);
  const totalRightWidth = getTotalWidth(rightActions);

  // -------------------------------------------------------------------------
  // Snap helpers
  // -------------------------------------------------------------------------

  const snapTo = useCallback(
    (toValue: number, velocity = 0) => {
      Animated.spring(translateX, {
        toValue,
        velocity,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    },
    [translateX]
  );

  const snapClosed = useCallback(
    (velocity = 0) => snapTo(0, velocity),
    [snapTo]
  );

  const snapOpenLeft = useCallback(
    (velocity = 0) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      snapTo(totalLeftWidth, velocity);
    },
    [snapTo, totalLeftWidth]
  );

  const snapOpenRight = useCallback(
    (velocity = 0) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      snapTo(-totalRightWidth, velocity);
    },
    [snapTo, totalRightWidth]
  );

  // -------------------------------------------------------------------------
  // PanResponder
  // -------------------------------------------------------------------------

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (!enabled) return false;
        // N'activer que si le mouvement horizontal est dominant
        return (
          Math.abs(gestureState.dx) > 5 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },

      onPanResponderGrant: () => {
        // Stocker la valeur courante comme point de départ du geste
        startX.current = currentX.current;
        translateX.setOffset(startX.current);
        translateX.setValue(0);
      },

      onPanResponderMove: (_evt, gestureState) => {
        const raw = gestureState.dx;

        // Limiter le déplacement aux bornes des actions disponibles
        let clamped = raw;
        if (raw > 0 && leftActions.length === 0) clamped = 0;
        if (raw < 0 && rightActions.length === 0) clamped = 0;

        // Résistance élastique au-delà des bornes
        if (raw > totalLeftWidth) {
          clamped = totalLeftWidth + (raw - totalLeftWidth) * 0.2;
        } else if (raw < -totalRightWidth) {
          clamped = -totalRightWidth + (raw + totalRightWidth) * 0.2;
        }

        translateX.setValue(clamped);
      },

      onPanResponderRelease: (_evt, gestureState) => {
        translateX.flattenOffset();

        const dx = gestureState.dx;
        const vx = gestureState.vx;

        // Décision snap selon seuil ou vélocité
        if (dx > 0) {
          // Mouvement vers la droite → actions gauche
          if (
            leftActions.length > 0 &&
            (dx > totalLeftWidth * SNAP_THRESHOLD_RATIO || vx > 0.5)
          ) {
            snapOpenLeft(vx);
            onSwipeRight?.();
          } else {
            snapClosed(vx);
          }
        } else {
          // Mouvement vers la gauche → actions droite
          if (
            rightActions.length > 0 &&
            (Math.abs(dx) > totalRightWidth * SNAP_THRESHOLD_RATIO ||
              vx < -0.5)
          ) {
            snapOpenRight(vx);
            onSwipeLeft?.();
          } else {
            snapClosed(vx);
          }
        }
      },

      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapClosed();
      },
    })
  ).current;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View style={[styles.container, style]}>
      {/* Actions gauche */}
      {leftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActions]}>
          {leftActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                {
                  width: action.width ?? ACTION_DEFAULT_WIDTH,
                  backgroundColor: action.color,
                },
              ]}
              onPress={() => {
                snapClosed();
                action.onPress();
              }}
              activeOpacity={0.8}
            >
              {action.icon ? (
                <Text style={[styles.actionIcon, { color: action.textColor ?? "#fff" }]}>
                  {action.icon}
                </Text>
              ) : null}
              <Text style={[styles.actionLabel, { color: action.textColor ?? "#fff" }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Actions droite */}
      {rightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActions]}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                {
                  width: action.width ?? ACTION_DEFAULT_WIDTH,
                  backgroundColor: action.color,
                },
              ]}
              onPress={() => {
                snapClosed();
                action.onPress();
              }}
              activeOpacity={0.8}
            >
              {action.icon ? (
                <Text style={[styles.actionIcon, { color: action.textColor ?? "#fff" }]}>
                  {action.icon}
                </Text>
              ) : null}
              <Text style={[styles.actionLabel, { color: action.textColor ?? "#fff" }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Contenu principal glissable */}
      <Animated.View
        style={[
          styles.rowContent,
          { backgroundColor: theme.colors.card, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  actionsContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "stretch",
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  rowContent: {
    width: "100%",
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { SwipeableRow };
export default SwipeableRow;
