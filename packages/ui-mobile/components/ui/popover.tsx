// @/components/ui/popover.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export interface PopoverProps {
  /** Élément déclencheur du popover */
  children: React.ReactNode;
  /** Contenu affiché dans le panneau popover */
  content: React.ReactNode;
  /** Position du panneau par rapport au trigger. Défaut : 'bottom' */
  placement?: PopoverPlacement;
  /** Mode contrôlé : visibilité externe */
  visible?: boolean;
  /** Callback appelé lors d'un changement de visibilité */
  onVisibilityChange?: (v: boolean) => void;
  /** Ferme le popover lors d'un appui sur le fond. Défaut : true */
  closeOnBackdropPress?: boolean;
  /** Variante visuelle. Défaut : 'default' */
  variant?: "default" | "glass";
  /** Style supplémentaire pour le wrapper du trigger */
  style?: StyleProp<ViewStyle>;
  /** Style supplémentaire pour le panneau popover */
  contentStyle?: StyleProp<ViewStyle>;
  /** Espace entre le trigger et le panneau en px. Défaut : 8 */
  offset?: number;
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

interface TriggerMeasure {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface PopoverPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface ArrowStyle {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRightColor?: string;
}

const ARROW_SIZE = 7;

function computePosition(
  placement: PopoverPlacement,
  trigger: TriggerMeasure,
  popoverWidth: number,
  popoverHeight: number,
  offset: number,
  arrowColor: string
): { position: PopoverPosition; arrowStyle: ArrowStyle; arrowContainerStyle: ViewStyle } {
  const { pageX, pageY, width: tW, height: tH } = trigger;
  const screen = Dimensions.get("window");

  // Centres
  const triggerCenterX = pageX + tW / 2;
  const triggerCenterY = pageY + tH / 2;

  // Position par défaut (bottom centré)
  let position: PopoverPosition = {};
  let arrowStyle: ArrowStyle = {};
  let arrowContainerStyle: ViewStyle = {};

  switch (placement) {
    // --- top ---
    case "top": {
      const left = Math.max(8, Math.min(screen.width - popoverWidth - 8, triggerCenterX - popoverWidth / 2));
      position = { top: pageY - popoverHeight - offset, left };
      arrowContainerStyle = { position: "absolute", bottom: -ARROW_SIZE * 2, left: 0, right: 0, alignItems: "center" };
      arrowStyle = { borderTopWidth: ARROW_SIZE, borderTopColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }
    case "top-start": {
      const left = Math.max(8, pageX);
      position = { top: pageY - popoverHeight - offset, left };
      arrowContainerStyle = { position: "absolute", bottom: -ARROW_SIZE * 2, left: ARROW_SIZE * 2 };
      arrowStyle = { borderTopWidth: ARROW_SIZE, borderTopColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }
    case "top-end": {
      const right = Math.max(8, screen.width - pageX - tW);
      position = { top: pageY - popoverHeight - offset, right };
      arrowContainerStyle = { position: "absolute", bottom: -ARROW_SIZE * 2, right: ARROW_SIZE * 2 };
      arrowStyle = { borderTopWidth: ARROW_SIZE, borderTopColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }

    // --- bottom ---
    case "bottom": {
      const left = Math.max(8, Math.min(screen.width - popoverWidth - 8, triggerCenterX - popoverWidth / 2));
      position = { top: pageY + tH + offset, left };
      arrowContainerStyle = { position: "absolute", top: -ARROW_SIZE * 2, left: 0, right: 0, alignItems: "center" };
      arrowStyle = { borderBottomWidth: ARROW_SIZE, borderBottomColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }
    case "bottom-start": {
      const left = Math.max(8, pageX);
      position = { top: pageY + tH + offset, left };
      arrowContainerStyle = { position: "absolute", top: -ARROW_SIZE * 2, left: ARROW_SIZE * 2 };
      arrowStyle = { borderBottomWidth: ARROW_SIZE, borderBottomColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }
    case "bottom-end": {
      const right = Math.max(8, screen.width - pageX - tW);
      position = { top: pageY + tH + offset, right };
      arrowContainerStyle = { position: "absolute", top: -ARROW_SIZE * 2, right: ARROW_SIZE * 2 };
      arrowStyle = { borderBottomWidth: ARROW_SIZE, borderBottomColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
      break;
    }

    // --- left ---
    case "left": {
      const top = Math.max(8, Math.min(screen.height - popoverHeight - 8, triggerCenterY - popoverHeight / 2));
      position = { top, left: pageX - popoverWidth - offset };
      arrowContainerStyle = { position: "absolute", right: -ARROW_SIZE * 2, top: 0, bottom: 0, justifyContent: "center" };
      arrowStyle = { borderLeftWidth: ARROW_SIZE, borderLeftColor: arrowColor, borderTopWidth: ARROW_SIZE, borderBottomWidth: ARROW_SIZE, borderTopColor: "transparent", borderBottomColor: "transparent" };
      break;
    }

    // --- right ---
    case "right": {
      const top = Math.max(8, Math.min(screen.height - popoverHeight - 8, triggerCenterY - popoverHeight / 2));
      position = { top, left: pageX + tW + offset };
      arrowContainerStyle = { position: "absolute", left: -ARROW_SIZE * 2, top: 0, bottom: 0, justifyContent: "center" };
      arrowStyle = { borderRightWidth: ARROW_SIZE, borderRightColor: arrowColor, borderTopWidth: ARROW_SIZE, borderBottomWidth: ARROW_SIZE, borderTopColor: "transparent", borderBottomColor: "transparent" };
      break;
    }

    default: {
      // fallback bottom centré
      const left = Math.max(8, Math.min(screen.width - popoverWidth - 8, triggerCenterX - popoverWidth / 2));
      position = { top: pageY + tH + offset, left };
      arrowContainerStyle = { position: "absolute", top: -ARROW_SIZE * 2, left: 0, right: 0, alignItems: "center" };
      arrowStyle = { borderBottomWidth: ARROW_SIZE, borderBottomColor: arrowColor, borderLeftWidth: ARROW_SIZE, borderRightWidth: ARROW_SIZE, borderLeftColor: "transparent", borderRightColor: "transparent" };
    }
  }

  return { position, arrowStyle, arrowContainerStyle };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  placement = "bottom",
  visible: visibleProp,
  onVisibilityChange,
  closeOnBackdropPress = true,
  variant = "default",
  style,
  contentStyle,
  offset = 8,
}) => {
  const { theme, isDark } = useTheme();
  const glassTokens = variant === "glass" ? createGlassTheme(theme, isDark) : null;

  // Mode contrôlé vs non-contrôlé
  const isControlled = visibleProp !== undefined;
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = isControlled ? visibleProp : internalVisible;

  const triggerRef = useRef<View>(null);
  const [triggerMeasure, setTriggerMeasure] = useState<TriggerMeasure | null>(null);
  /** Dimensions du panneau popover, mesurées après premier rendu */
  const [popoverSize, setPopoverSize] = useState({ width: 200, height: 100 });

  // -------------------------------------------------------------------------
  // Visibility helpers
  // -------------------------------------------------------------------------

  const open = useCallback(() => {
    // Mesurer le trigger avant d'ouvrir
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setTriggerMeasure({ x, y, width, height, pageX, pageY });
      if (!isControlled) setInternalVisible(true);
      onVisibilityChange?.(true);
    });
  }, [isControlled, onVisibilityChange]);

  const close = useCallback(() => {
    if (!isControlled) setInternalVisible(false);
    onVisibilityChange?.(false);
  }, [isControlled, onVisibilityChange]);

  // Re-mesurer quand le popover controlled devient visible
  useEffect(() => {
    if (isControlled && visibleProp) {
      triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setTriggerMeasure({ x, y, width, height, pageX, pageY });
      });
    }
  }, [isControlled, visibleProp]);

  // -------------------------------------------------------------------------
  // Position calcul
  // -------------------------------------------------------------------------

  // Pour le variant glass, on utilise la couleur de surface semi-transparente issue du matériau
  const panelColor =
    variant === "glass" && glassTokens
      ? glassTokens.materials.floating.background
      : theme.colors.card;

  const { position, arrowStyle, arrowContainerStyle } = triggerMeasure
    ? computePosition(placement, triggerMeasure, popoverSize.width, popoverSize.height, offset, panelColor)
    : { position: { top: 0, left: 0 }, arrowStyle: {}, arrowContainerStyle: {} as ViewStyle };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const panelStyle: ViewStyle = {
    position: "absolute",
    borderRadius: 12,
    overflow: "visible",
    backgroundColor: panelColor,
    // Ombres
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    ...position,
  };

  if (variant === "glass" && glassTokens) {
    panelStyle.borderWidth = 1;
    panelStyle.borderColor = glassTokens.border.subtle;
  }

  return (
    <>
      {/* Trigger */}
      <View ref={triggerRef} style={style} collapsable={false}>
        <TouchableWithoutFeedback onPress={open}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </View>

      {/* Overlay Modal */}
      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Fond transparent pour fermer au clic */}
        <TouchableWithoutFeedback
          onPress={closeOnBackdropPress ? close : undefined}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Panneau popover */}
        <View
          style={[panelStyle, contentStyle]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPopoverSize({ width, height });
          }}
        >
          {/* Flèche indicatrice */}
          <View style={arrowContainerStyle as ViewStyle}>
            <View style={[styles.arrow, arrowStyle]} />
          </View>

          {/* Contenu */}
          <View style={styles.contentPadding}>{content}</View>
        </View>
      </Modal>
    </>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
  contentPadding: {
    padding: 12,
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Popover };
export default Popover;
