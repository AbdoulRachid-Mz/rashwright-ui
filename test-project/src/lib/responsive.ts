// @/lib/responsive.ts
/**
 * Système de breakpoints standard et résolution responsive pour Rashwright UI Mobile.
 * Sans dépendance React Native (pur TypeScript).
 */

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type ResponsiveRecord<T> = {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
};

export type ResponsiveValue<T> = T | ResponsiveRecord<T>;

/**
 * Détermine le breakpoint actif en fonction de la largeur en pixels
 */
export function getBreakpointFromWidth(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  return "sm";
}

/**
 * Vérifie si la valeur fournie est un enregistrement responsive ({ sm, md, lg, ... })
 */
export function isResponsiveRecord<T>(val: unknown): val is ResponsiveRecord<T> {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  return (
    "sm" in val ||
    "md" in val ||
    "lg" in val ||
    "xl" in val ||
    "2xl" in val
  );
}

/**
 * Résout une valeur responsive selon le breakpoint actif (Mobile First avec fallback fluide descendant)
 */
export function resolveResponsiveValue<T>(
  val: ResponsiveValue<T> | undefined,
  currentBreakpoint: Breakpoint,
  fallback: T
): T {
  if (val === undefined || val === null) return fallback;
  if (!isResponsiveRecord<T>(val)) return val as T;

  const order: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm"];
  const currentIndex = order.indexOf(currentBreakpoint);

  // Recherche descendante depuis le breakpoint actuel vers sm
  for (let i = currentIndex; i < order.length; i++) {
    const bp = order[i];
    if (val[bp] !== undefined) {
      return val[bp] as T;
    }
  }

  // Recherche ascendante si aucune valeur inférieure n'est définie
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = order[i];
    if (val[bp] !== undefined) {
      return val[bp] as T;
    }
  }

  return fallback;
}
