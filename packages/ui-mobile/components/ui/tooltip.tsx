// @/components/ui/tooltip.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";

type TooltipPlacement = "top" | "bottom" | "left" | "right";
type TooltipTrigger = "hover" | "press" | "longPress";

type TriggerProps = {
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
};

interface TooltipContextType {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  placement: TooltipPlacement;
  resolvedPlacement: TooltipPlacement;
  setMeasuredDimensions: (w: number, h: number) => void;
  tooltipWidth: number;
  tooltipHeight: number;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within TooltipProvider");
  }
  return context;
};

export interface TooltipProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export const Tooltip = ({
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  placement = "top",
  delayDuration = 200,
  skipDelayDuration = 200,
}: TooltipProps) => {
  const [isInternalVisible, setIsInternalVisible] = useState(defaultOpen);
  const [resolvedPlacement, setResolvedPlacement] =
    useState<TooltipPlacement>(placement);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const isControlled = open !== undefined;
  const isVisible = isControlled ? open : isInternalVisible;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const timeoutId = setTimeout(() => {
      if (!isControlled) setIsInternalVisible(true);
      onOpenChange?.(true);
    }, delayDuration);
    timeoutRef.current = timeoutId as unknown as number;
  }, [isControlled, onOpenChange, delayDuration]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const timeoutId = setTimeout(() => {
      if (!isControlled) setIsInternalVisible(false);
      onOpenChange?.(false);
    }, skipDelayDuration);
    timeoutRef.current = timeoutId as unknown as number;
  }, [isControlled, onOpenChange, skipDelayDuration]);

  const toggle = useCallback(() => {
    if (isVisible) hide();
    else show();
  }, [isVisible, show, hide]);

  const setMeasuredDimensions = useCallback(
    (width: number, height: number) => {
      setTooltipWidth(width);
      setTooltipHeight(height);
      const { width: screenWidth, height: screenHeight } =
        Dimensions.get("window");
      let newPlacement = placement;

      if (placement === "top" && tooltipHeight > screenHeight * 0.1) {
        newPlacement = "bottom";
      } else if (placement === "bottom" && tooltipHeight > screenHeight * 0.1) {
        newPlacement = "top";
      } else if (placement === "left" && tooltipWidth > screenWidth * 0.2) {
        newPlacement = "right";
      } else if (placement === "right" && tooltipWidth > screenWidth * 0.2) {
        newPlacement = "left";
      }

      setResolvedPlacement(newPlacement);
    },
    [placement, tooltipWidth, tooltipHeight]
  );

  const contextValue: TooltipContextType = {
    isVisible,
    show,
    hide,
    toggle,
    placement,
    resolvedPlacement,
    setMeasuredDimensions,
    tooltipWidth,
    tooltipHeight,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      <View style={styles.container}>{children}</View>
    </TooltipContext.Provider>
  );
};

export interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const TooltipTrigger = ({
  children,
  asChild = false,
}: TooltipTriggerProps) => {
  const { show, hide, toggle } = useTooltip();

  if (asChild && React.isValidElement<TriggerProps>(children)) {
    return React.cloneElement(children, {
      onPressIn: () => {
        children.props.onPressIn?.();
        show();
      },
      onPressOut: () => {
        children.props.onPressOut?.();
        hide();
      },
      onLongPress: () => {
        children.props.onLongPress?.();
        toggle();
      },
    });
  }

  return (
    <Pressable onPressIn={show} onPressOut={hide} onLongPress={toggle}>
      {children}
    </Pressable>
  );
};

export interface TooltipContentProps {
  children: ReactNode;
  sideOffset?: number;
  alignOffset?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const TooltipContent = ({
  children,
  sideOffset = 8,
  style,
}: TooltipContentProps) => {
  const { theme, isDark } = useTheme();
  const {
    isVisible,
    resolvedPlacement,
    setMeasuredDimensions,
    tooltipWidth,
    tooltipHeight,
  } = useTooltip();

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const [layoutMeasured, setLayoutMeasured] = useState(false);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 140 });
      scale.value = withTiming(0.92, { duration: 140 });
    }
  }, [isVisible]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMeasuredDimensions(width, height);
    setLayoutMeasured(true);
  };

  const getPositionStyle = (): ViewStyle => {
    if (!layoutMeasured) return {};

    switch (resolvedPlacement) {
      case "top":
        return {
          marginBottom: sideOffset,
          alignSelf: "center",
          transform: [{ translateY: -tooltipHeight }],
        };
      case "bottom":
        return {
          marginTop: sideOffset,
          alignSelf: "center",
        };
      case "left":
        return {
          marginRight: sideOffset,
          alignSelf: "center",
          transform: [{ translateX: -tooltipWidth }],
        };
      case "right":
        return {
          marginLeft: sideOffset,
          alignSelf: "center",
        };
      default:
        return {};
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible && !layoutMeasured) return null;

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.tooltipContent,
        getPositionStyle(),
        animatedStyle,
        style,
      ]}
    >
      <LiquidSurface
        material="thick"
        borderRadius={theme.borderRadius.md}
        style={styles.surfaceInner}
      >
        <ThemedText variant="xs" weight="medium" style={styles.tooltipText}>
          {children}
        </ThemedText>
      </LiquidSurface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipContent: {
    position: "absolute",
    maxWidth: 280,
    zIndex: 1000,
  },
  surfaceInner: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tooltipText: {
    textAlign: "center",
  },
});
