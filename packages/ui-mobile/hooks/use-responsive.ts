// @/hooks/use-responsive.ts
/**
 * Hook réactif aux dimensions d'écran pour Rashwright UI Mobile.
 */

import { useWindowDimensions } from "react-native";
import { useMemo } from "react";
import {
  Breakpoint,
  BREAKPOINTS,
  ResponsiveRecord,
  ResponsiveValue,
  getBreakpointFromWidth,
  isResponsiveRecord,
  resolveResponsiveValue,
} from "@/lib/responsive";

export type { Breakpoint, ResponsiveRecord, ResponsiveValue };
export { BREAKPOINTS, getBreakpointFromWidth, isResponsiveRecord, resolveResponsiveValue };

export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  resolve: <T>(val: ResponsiveValue<T> | undefined, fallback: T) => T;
}

/**
 * Hook réactif aux dimensions de fenêtre avec détection automatique des breakpoints standard
 */
export function useResponsive(): ResponsiveState {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint = useMemo(() => {
    return getBreakpointFromWidth(width);
  }, [width]);

  const isSm = width < BREAKPOINTS.md;
  const isMd = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isLg = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
  const isXl = width >= BREAKPOINTS.xl && width < BREAKPOINTS["2xl"];
  const is2Xl = width >= BREAKPOINTS["2xl"];
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.xl;
  const isDesktop = width >= BREAKPOINTS.xl;

  return {
    width,
    height,
    breakpoint,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isTablet,
    isDesktop,
    resolve: <T>(val: ResponsiveValue<T> | undefined, fallback: T) =>
      resolveResponsiveValue(val, breakpoint, fallback),
  };
}

export default useResponsive;
