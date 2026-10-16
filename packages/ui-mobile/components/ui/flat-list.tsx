// @/components/ui/flat-list.tsx
/**
 * ThemedFlatList — Composant FlatList enrichi pour Rashwright UI Mobile.
 *
 * Fonctionnalités avancées :
 * - Grille responsive multi-colonnes adaptative selon breakpoints standard (sm, md, lg, xl, 2xl)
 * - Support de valeurs responsive (ex: { sm: 1, md: 1, lg: 2, xl: 3 })
 * - Props de tri intelligentes (sortBy, sortOrder, sortFn)
 * - Intégration native fluide de carrousels (prop carousels) insérés à des index personnalisés
 * - RefreshControl thémé automatique
 * - Fluidité 60fps garantie avec virtualisation de rangées
 */

import React, { forwardRef, useMemo, useState } from "react";
import {
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  RefreshControl,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  ListRenderItemInfo,
  DimensionValue,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { useResponsive, type ResponsiveValue } from "@/hooks/use-responsive";
import Carousel from "./carousel";
import ThemedText from "./text";

export interface FlatListCarouselSlot<C = unknown> {
  id?: string;
  /** Index dans la liste où insérer le carrousel (défaut: 0, au début) */
  index?: number;
  /** Titre ou label au-dessus du carrousel */
  title?: string;
  /** Données du carrousel */
  data: C[];
  /** Rendu d'un item du carrousel */
  renderItem: (item: C, index: number) => React.ReactNode;
  /** Nombre d'items visibles par vue (supporte responsive: { sm: 1, md: 2, lg: 3 }) */
  itemsPerView?: ResponsiveValue<number>;
  /** Largeur forcée d'un item */
  itemWidth?: number;
  /** Espacement entre items */
  spacing?: number;
  /** Défilement automatique */
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  onItemPress?: (item: C, index: number) => void;
  style?: StyleProp<ViewStyle>;
}

export type FlatListSortOrder = "asc" | "desc";

export interface ThemedFlatListProps<T> extends Omit<RNFlatListProps<T>, "data"> {
  data?: readonly T[] | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;

  // ─── Grid System & Responsive Props ──────────────────────────────────────
  /**
   * Active le mode grille adaptatif
   */
  grid?: boolean;

  /**
   * Éléments de grille additionnels ou alternatifs
   */
  gridElements?: readonly T[] | null;

  /**
   * Nombre de colonnes adaptatif selon les breakpoints standard (sm, md, lg, xl, 2xl)
   * Exemple : { sm: 1, md: 1, lg: 2 }
   * @default 1 (ou { sm: 1, md: 2, lg: 3 } si grid=true)
   */
  columns?: ResponsiveValue<number>;

  /**
   * Espacement global entre éléments de la grille (gap)
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
   * Clé de l'objet T à trier, ou fonction de comparaison (a, b) => number
   */
  sortBy?: keyof T | ((a: T, b: T) => number);

  /**
   * Ordre de tri ascendant ou descendant
   * @default "asc"
   */
  sortOrder?: FlatListSortOrder;

  /**
   * Fonction de tri custom
   */
  sortFn?: (a: T, b: T) => number;

  // ─── Intégration Native Carrousels ─────────────────────────────────────────
  /**
   * Carrousels à intégrer dans la grille à des positions définies
   */
  carousels?: FlatListCarouselSlot<unknown>[] | FlatListCarouselSlot<unknown>;
}

type VirtualRow<T> =
  | { type: "items"; items: { item: T; originalIndex: number }[]; key: string }
  | { type: "carousel"; slot: FlatListCarouselSlot<unknown>; key: string };

function ThemedFlatListComponent<T>(
  {
    data,
    gridElements,
    grid = false,
    columns,
    numColumns: legacyNumColumns,
    gap,
    rowGap,
    columnGap,
    sortBy,
    sortOrder = "asc",
    sortFn,
    carousels,
    refreshing,
    onRefresh,
    renderItem,
    keyExtractor,
    onLayout,
    contentContainerStyle,
    ...props
  }: ThemedFlatListProps<T>,
  ref: React.ForwardedRef<RNFlatList<T>>
) {
  const { theme, isDark } = useTheme();
  const { resolve } = useResponsive();
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const isGridMode = Boolean(
    grid || gridElements !== undefined || columns !== undefined || legacyNumColumns !== undefined
  );

  // Résolution des colonnes selon les breakpoints
  const resolvedColumns = useMemo(() => {
    if (legacyNumColumns !== undefined && columns === undefined) {
      return Math.max(1, legacyNumColumns);
    }
    if (!isGridMode) return 1;
    const raw = resolve(columns, grid ? 2 : 1);
    return Math.max(1, Math.floor(raw));
  }, [isGridMode, legacyNumColumns, resolve, columns, grid]);

  // Résolution des espacements
  const resolvedGap = useMemo(() => resolve(gap, 12), [resolve, gap]);
  const resolvedRowGap = useMemo(() => resolve(rowGap, resolvedGap), [resolve, rowGap, resolvedGap]);
  const resolvedColumnGap = useMemo(() => resolve(columnGap, resolvedGap), [resolve, columnGap, resolvedGap]);

  // 1. Fusion des données (data + gridElements)
  const combinedData = useMemo(() => {
    const list: T[] = [];
    if (data) list.push(...data);
    if (gridElements) list.push(...gridElements);
    return list;
  }, [data, gridElements]);

  // 2. Tri des éléments
  const sortedData = useMemo(() => {
    if (!sortBy && !sortFn) return combinedData;

    const listCopy = [...combinedData];

    if (sortFn) {
      return listCopy.sort(sortFn);
    }

    if (typeof sortBy === "function") {
      return listCopy.sort(sortBy);
    }

    if (sortBy) {
      const key = sortBy;
      return listCopy.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[key as string];
        const valB = (b as Record<string, unknown>)[key as string];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        let cmp = 0;
        if (typeof valA === "string" && typeof valB === "string") {
          cmp = valA.localeCompare(valB);
        } else {
          cmp = (valA as number) < (valB as number) ? -1 : 1;
        }
        return sortOrder === "desc" ? -cmp : cmp;
      });
    }

    return listCopy;
  }, [combinedData, sortBy, sortOrder, sortFn]);

  // 3. Normalisation des carrousels
  const carouselList = useMemo(() => {
    if (!carousels) return [];
    return Array.isArray(carousels) ? carousels : [carousels];
  }, [carousels]);

  // 4. Largeur calculée par colonne
  const calculatedColumnWidth = useMemo<DimensionValue>(() => {
    if (resolvedColumns <= 1) return "100%";
    if (containerWidth > 0) {
      const totalSpacing = (resolvedColumns - 1) * resolvedColumnGap;
      const availableWidth = containerWidth - totalSpacing;
      return Math.max(0, Math.floor(availableWidth / resolvedColumns));
    }
    return `${Number((100 / resolvedColumns).toFixed(2))}%` as DimensionValue;
  }, [resolvedColumns, resolvedColumnGap, containerWidth]);

  // RefreshControl thémé
  const refreshControl =
    refreshing !== undefined && onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
        progressBackgroundColor={isDark ? theme.colors.card : theme.colors.background}
      />
    ) : undefined;

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
    onLayout?.(e);
  };

  // 5. Virtualisation par rangées si colonnes > 1 ou carrousels intermédiaires
  const virtualRows = useMemo(() => {
    const rows: VirtualRow<T>[] = [];
    const placedCarousels = new Set<FlatListCarouselSlot<unknown>>();

    // Carrousels placés au début
    carouselList
      .filter((c) => c.index === undefined || c.index <= 0)
      .forEach((slot, idx) => {
        rows.push({
          type: "carousel",
          slot,
          key: slot.id || `carousel-start-${idx}`,
        });
        placedCarousels.add(slot);
      });

    let currentChunk: { item: T; originalIndex: number }[] = [];

    sortedData.forEach((item, itemIdx) => {
      // Carrousel inséré à cet index ?
      const matchingCarousels = carouselList.filter(
        (c) => !placedCarousels.has(c) && c.index === itemIdx
      );

      if (matchingCarousels.length > 0) {
        if (currentChunk.length > 0) {
          rows.push({
            type: "items",
            items: currentChunk,
            key: `row-${rows.length}`,
          });
          currentChunk = [];
        }

        matchingCarousels.forEach((slot, sIdx) => {
          rows.push({
            type: "carousel",
            slot,
            key: slot.id || `carousel-mid-${itemIdx}-${sIdx}`,
          });
          placedCarousels.add(slot);
        });
      }

      currentChunk.push({ item, originalIndex: itemIdx });

      if (currentChunk.length === resolvedColumns) {
        rows.push({
          type: "items",
          items: currentChunk,
          key: `row-${rows.length}`,
        });
        currentChunk = [];
      }
    });

    if (currentChunk.length > 0) {
      rows.push({
        type: "items",
        items: currentChunk,
        key: `row-${rows.length}`,
      });
    }

    // Carrousels restants à la fin
    carouselList
      .filter((c) => !placedCarousels.has(c))
      .forEach((slot, idx) => {
        rows.push({
          type: "carousel",
          slot,
          key: slot.id || `carousel-end-${idx}`,
        });
      });

    return rows;
  }, [sortedData, carouselList, resolvedColumns]);

  // Si pas de grille ni de carrousels, on délègue au FlatList natif standard pour performance maximale
  if (!isGridMode && carouselList.length === 0) {
    return (
      <RNFlatList
        ref={ref}
        data={sortedData}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onLayout={handleLayout}
        contentContainerStyle={contentContainerStyle}
        {...props}
      />
    );
  }

  // Rendu en grille virtuelle virtualisée
  return (
    <RNFlatList
      ref={ref as unknown as React.ForwardedRef<RNFlatList<VirtualRow<T>>>}
      {...(props as unknown as RNFlatListProps<VirtualRow<T>>)}
      data={virtualRows}
      key={`grid-cols-${resolvedColumns}`}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      onLayout={handleLayout}
      contentContainerStyle={[
        { gap: resolvedRowGap },
        contentContainerStyle,
      ]}
      renderItem={({ item: rowItem }) => {
        if (rowItem.type === "carousel") {
          const { slot } = rowItem;
          return (
            <View style={styles.carouselContainer}>
              {slot.title && (
                <ThemedText
                  variant="base"
                  weight="semibold"
                  style={styles.carouselTitle}
                >
                  {slot.title}
                </ThemedText>
              )}
              <Carousel
                data={slot.data}
                renderItem={slot.renderItem}
                itemsPerView={slot.itemsPerView}
                itemWidth={slot.itemWidth}
                spacing={slot.spacing ?? 12}
                autoPlay={slot.autoPlay}
                autoPlayInterval={slot.autoPlayInterval}
                showIndicators={slot.showIndicators}
                showArrows={slot.showArrows}
                loop={slot.loop}
                onItemPress={slot.onItemPress}
                containerStyle={slot.style as ViewStyle}
              />
            </View>
          );
        }

        // Rangée d'éléments de la grille
        return (
          <View
            style={[
              styles.rowContainer,
              {
                columnGap: resolvedColumnGap,
              },
            ]}
          >
            {rowItem.items.map(({ item, originalIndex }) => {
              const itemKey = keyExtractor
                ? keyExtractor(item, originalIndex)
                : `item-${originalIndex}`;

              const itemInfo: ListRenderItemInfo<T> = {
                item,
                index: originalIndex,
                separators: {
                  highlight: () => {},
                  unhighlight: () => {},
                  updateProps: () => {},
                },
              };

              return (
                <View
                  key={itemKey}
                  style={[
                    styles.columnItem,
                    {
                      width: calculatedColumnWidth,
                    },
                  ]}
                >
                  {renderItem ? renderItem(itemInfo) : null}
                </View>
              );
            })}
          </View>
        );
      }}
    />
  );
}

const ThemedFlatList = forwardRef(ThemedFlatListComponent) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.ForwardedRef<RNFlatList<T>> }
) => React.ReactElement;

(ThemedFlatList as unknown as { displayName: string }).displayName = "FlatList";

export default ThemedFlatList;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  columnItem: {
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
});
