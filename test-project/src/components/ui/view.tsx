// @/components/ui/view.tsx
/**
 * ThemedView — Composant View enrichi pour Rashwright UI Mobile.
 *
 * Fonctionnalités avancées :
 * - Grille responsive multi-colonnes adaptative selon breakpoints standard (sm, md, lg, xl, 2xl)
 * - Support de valeurs responsive d'exemple : { sm: 1, md: 1, lg: 2, xl: 3 }
 * - Props de tri intelligentes (sortBy, sortOrder, sortKey)
 * - Intégration native fluide de carrousels (prop carousels) insérés à des index personnalisés
 * - Compatibilité totale avec NativeWind (className) et Liquid Glass (backgrounds thémés)
 */

import React, { forwardRef, useMemo, useState } from "react";
import {
  StyleProp,
  ViewStyle,
  View as RNView,
  ViewProps as RNViewProps,
  StyleSheet,
  LayoutChangeEvent,
  DimensionValue,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import { useResponsive, type ResponsiveValue } from "@/hooks/use-responsive";
import ThemedText from "./text";

export interface CarouselSlot<T = unknown> {
  id?: string;
  /** Index d'insertion dans la grille (défaut: 0, au début) */
  index?: number;
  /** Titre ou label au-dessus du carrousel */
  title?: string;
  /** Données du carrousel */
  data: T[];
  /** Rendu de chaque carte */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Nombre d'éléments par vue, supporte les breakpoints (ex: { sm: 1, md: 2, lg: 3 }) */
  itemsPerView?: ResponsiveValue<number>;
  /** Largeur forcée d'un item */
  itemWidth?: number;
  /** Espacement entre cartes */
  spacing?: number;
  /** Défilement automatique */
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  onItemPress?: (item: T, index: number) => void;
  style?: StyleProp<ViewStyle>;
}

export type GridSortOrder = "asc" | "desc";

export interface ThemedViewProps extends RNViewProps {
  children?: React.ReactNode;
  background?:
    | "background"
    | "card"
    | "secondary"
    | "muted"
    | "accent"
    | "transparent";
  className?: string;
  style?: StyleProp<ViewStyle>;

  // ─── Grid System & Responsive Props ──────────────────────────────────────
  /**
   * Active le mode grille adaptatif
   */
  grid?: boolean;

  /**
   * Éléments spécifiques de grille (alternative ou complément à children)
   */
  gridElements?: React.ReactNode[];

  /**
   * Nombre de colonnes adaptatif selon les breakpoints standard (sm, md, lg, xl, 2xl)
   * Exemple : { sm: 1, md: 1, lg: 2 }
   * @default 1
   */
  columns?: ResponsiveValue<number>;

  /**
   * Nombre de lignes max (optionnel)
   */
  rows?: ResponsiveValue<number>;

  /**
   * Espacement global entre cellules de la grille (gap)
   * @default 12
   */
  gap?: ResponsiveValue<number>;

  /**
   * Espacement vertical entre lignes (rowGap)
   */
  rowGap?: ResponsiveValue<number>;

  /**
   * Espacement horizontal entre colonnes (columnGap)
   */
  columnGap?: ResponsiveValue<number>;

  // ─── Tri (Sorting) ────────────────────────────────────────────────────────
  /**
   * Fonction de tri custom ou ordre prédéfini ("asc" | "desc")
   */
  sortBy?: ((a: React.ReactNode, b: React.ReactNode) => number) | "asc" | "desc";

  /**
   * Ordre de tri ascendant ou descendant
   * @default "asc"
   */
  sortOrder?: GridSortOrder;

  /**
   * Clé ou fonction d'extraction de valeur pour le tri des éléments
   */
  sortKey?: (child: React.ReactNode, index: number) => string | number;

  // ─── Intégration Native Carrousels ─────────────────────────────────────────
  /**
   * Carrousels à intégrer dans la grille à des positions définies
   */
  carousels?: CarouselSlot<unknown>[] | CarouselSlot<unknown>;
}

const ThemedView = forwardRef<RNView, ThemedViewProps>(
  (
    {
      children,
      background = "transparent",
      className,
      style,
      grid = false,
      gridElements,
      columns,
      rows,
      gap,
      rowGap,
      columnGap,
      sortBy,
      sortOrder = "asc",
      sortKey,
      carousels,
      onLayout,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { resolve } = useResponsive();
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const backgroundColor =
      background === "transparent"
        ? "transparent"
        : theme.colors[background];

    const isGridMode = Boolean(grid || gridElements !== undefined || columns !== undefined);

    // Résolution fluide des colonnes responsive
    const resolvedColumns = useMemo(() => {
      if (!isGridMode) return 1;
      const raw = resolve(columns, grid ? 2 : 1);
      return Math.max(1, Math.floor(raw));
    }, [isGridMode, resolve, columns, grid]);

    // Résolution fluide des espacements (gap)
    const resolvedGap = useMemo(() => resolve(gap, 12), [resolve, gap]);
    const resolvedRowGap = useMemo(() => resolve(rowGap, resolvedGap), [resolve, rowGap, resolvedGap]);
    const resolvedColumnGap = useMemo(() => resolve(columnGap, resolvedGap), [resolve, columnGap, resolvedGap]);

    // 1. Récupération et normalisation des éléments enfants et gridElements
    const rawItems = useMemo(() => {
      const items: React.ReactNode[] = [];
      if (children) {
        items.push(...React.Children.toArray(children));
      }
      if (gridElements) {
        items.push(...gridElements);
      }
      return items;
    }, [children, gridElements]);

    // 2. Tri des éléments selon les props de tri
    const sortedItems = useMemo(() => {
      if (!sortBy && !sortKey) return rawItems;

      const itemsCopy = [...rawItems];

      if (typeof sortBy === "function") {
        return itemsCopy.sort(sortBy);
      }

      if (sortKey) {
        return itemsCopy.sort((a, b) => {
          const keyA = sortKey(a, 0);
          const keyB = sortKey(b, 0);
          const cmp = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
          return sortOrder === "desc" ? -cmp : cmp;
        });
      }

      if (sortBy === "asc" || sortBy === "desc") {
        const order = sortBy;
        return itemsCopy.sort((a, b) => {
          const extractText = (node: React.ReactNode): string => {
            if (node === null || node === undefined) return "";
            if (typeof node === "string" || typeof node === "number") return String(node);
            if (React.isValidElement(node) && node.props) {
              const childProps = node.props as {
                children?: React.ReactNode;
                accessibilityLabel?: string;
                id?: string;
              };
              if (childProps.accessibilityLabel) return childProps.accessibilityLabel;
              if (childProps.id) return String(childProps.id);
              if (typeof childProps.children === "string") return childProps.children;
            }
            return "";
          };
          const valA = extractText(a);
          const valB = extractText(b);
          const cmp = valA.localeCompare(valB);
          return order === "desc" ? -cmp : cmp;
        });
      }

      return itemsCopy;
    }, [rawItems, sortBy, sortOrder, sortKey]);

    // 3. Normalisation de la liste des carrousels
    const carouselList = useMemo(() => {
      if (!carousels) return [];
      return Array.isArray(carousels) ? carousels : [carousels];
    }, [carousels]);

    // 4. Largeur calculée par item pour fluidité 60fps
    const calculatedItemWidth = useMemo<DimensionValue>(() => {
      if (resolvedColumns <= 1) return "100%";
      if (containerWidth > 0) {
        const totalSpacing = (resolvedColumns - 1) * resolvedColumnGap;
        const availableWidth = containerWidth - totalSpacing;
        return Math.max(0, Math.floor(availableWidth / resolvedColumns));
      }
      return `${Number((100 / resolvedColumns).toFixed(2))}%` as DimensionValue;
    }, [resolvedColumns, resolvedColumnGap, containerWidth]);

    const handleLayout = (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width);
      onLayout?.(e);
    };

    // Mode View standard si pas de grille ni de carrousels
    if (!isGridMode && carouselList.length === 0) {
      return (
        <Animated.View
          ref={ref as unknown as React.ComponentPropsWithRef<typeof Animated.View>["ref"]}
          className={className}
          style={[{ backgroundColor }, style]}
          onLayout={handleLayout}
          {...props}
        >
          {children}
        </Animated.View>
      );
    }

    // 5. Fusion ordonnée des éléments et des carrousels
    type GridRenderEntry =
      | { type: "item"; content: React.ReactNode; key: string }
      | { type: "carousel"; slot: CarouselSlot<unknown>; key: string };

    const renderEntries = useMemo(() => {
      const entries: GridRenderEntry[] = [];
      const placedCarousels = new Set<CarouselSlot<unknown>>();

      // Carrousels placés au début (index <= 0 ou non défini)
      carouselList
        .filter((c) => c.index === undefined || c.index <= 0)
        .forEach((slot, idx) => {
          entries.push({
            type: "carousel",
            slot,
            key: slot.id || `carousel-start-${idx}`,
          });
          placedCarousels.add(slot);
        });

      // Parcours des items avec insertion des carrousels intermédiaires
      sortedItems.forEach((item, itemIdx) => {
        // Vérifier si un carrousel doit être inséré avant ou à cet index
        carouselList
          .filter((c) => !placedCarousels.has(c) && c.index === itemIdx)
          .forEach((slot, sIdx) => {
            entries.push({
              type: "carousel",
              slot,
              key: slot.id || `carousel-mid-${itemIdx}-${sIdx}`,
            });
            placedCarousels.add(slot);
          });

        entries.push({
          type: "item",
          content: item,
          key: `grid-item-${itemIdx}`,
        });
      });

      // Carrousels restants insérés à la fin
      carouselList
        .filter((c) => !placedCarousels.has(c))
        .forEach((slot, idx) => {
          entries.push({
            type: "carousel",
            slot,
            key: slot.id || `carousel-end-${idx}`,
          });
        });

      return entries;
    }, [sortedItems, carouselList]);

    return (
      <Animated.View
        ref={ref as unknown as React.ComponentPropsWithRef<typeof Animated.View>["ref"]}
        className={className}
        style={[
          styles.gridContainer,
          {
            backgroundColor,
            rowGap: resolvedRowGap,
            columnGap: resolvedColumnGap,
          },
          style,
        ]}
        onLayout={handleLayout}
        {...props}
      >
        {renderEntries.map((entry) => {
          if (entry.type === "carousel") {
            const { slot } = entry;
            return (
              <RNView key={entry.key} style={styles.carouselContainer}>
                {slot.title && (
                  <ThemedText
                    variant="base"
                    weight="semibold"
                    style={styles.carouselTitle}
                  >
                    {slot.title}
                  </ThemedText>
                )}
                <InlineGridCarousel
                  data={slot.data}
                  renderItem={slot.renderItem}
                  itemsPerView={slot.itemsPerView}
                  itemWidth={slot.itemWidth}
                  spacing={slot.spacing ?? 12}
                  showIndicators={slot.showIndicators}
                  onItemPress={slot.onItemPress}
                  style={slot.style}
                />
              </RNView>
            );
          }

          return (
            <RNView
              key={entry.key}
              style={[
                styles.gridItem,
                {
                  width: calculatedItemWidth,
                },
              ]}
            >
              {entry.content}
            </RNView>
          );
        })}
      </Animated.View>
    );
  }
);

ThemedView.displayName = "View";

export default ThemedView;

// ── Inline Grid Carousel Subcomponent ───────────────────────────────────────

interface InlineGridCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerView?: ResponsiveValue<number>;
  itemWidth?: number;
  spacing?: number;
  showIndicators?: boolean;
  onItemPress?: (item: T, index: number) => void;
  style?: StyleProp<ViewStyle>;
}

function InlineGridCarousel<T>({
  data,
  renderItem,
  itemsPerView = 1,
  itemWidth,
  spacing = 12,
  showIndicators = true,
  onItemPress,
  style,
}: InlineGridCarouselProps<T>) {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const { resolve } = useResponsive();
  const resolvedPerView = resolve(itemsPerView, 1);

  const calculatedW = useMemo(() => {
    if (itemWidth) return itemWidth;
    if (containerW > 0 && resolvedPerView > 0) {
      const totalSpacing = (resolvedPerView - 1) * spacing;
      return Math.max(80, Math.floor((containerW - totalSpacing) / resolvedPerView));
    }
    return 280;
  }, [itemWidth, containerW, resolvedPerView, spacing]);

  return (
    <RNView
      style={[styles.carouselInner, style]}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing, paddingHorizontal: 4 }}
        onScroll={(e) => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const newIdx = Math.round(offsetX / (calculatedW + spacing));
          if (newIdx !== activeIndex && newIdx >= 0 && newIdx < data.length) {
            setActiveIndex(newIdx);
          }
        }}
        scrollEventThrottle={16}
      >
        {data.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={onItemPress ? 0.75 : 1}
            onPress={() => onItemPress?.(item, idx)}
            disabled={!onItemPress}
            style={{ width: calculatedW }}
          >
            {renderItem(item, idx)}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showIndicators && data.length > 1 && (
        <RNView style={styles.indicatorRow}>
          {data.map((_, idx) => (
            <RNView
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    idx === activeIndex
                      ? theme.colors.primary
                      : theme.colors.mutedForeground,
                  opacity: idx === activeIndex ? 1 : 0.35,
                  width: idx === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </RNView>
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: "100%",
  },
  gridItem: {
    overflow: "hidden",
  },
  carouselContainer: {
    width: "100%",
    marginVertical: 4,
  },
  carouselTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  carouselInner: {
    width: "100%",
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});