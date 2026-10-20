// @/components/ui/reorderable-list.tsx
import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ReorderItemHelpers {
  /** Déplace l'élément d'un rang vers le haut */
  moveUp: () => void;
  /** Déplace l'élément d'un rang vers le bas */
  moveDown: () => void;
  /** L'élément est-il en tête de liste ? */
  isFirst: boolean;
  /** L'élément est-il en fin de liste ? */
  isLast: boolean;
  /** Index courant de l'élément */
  index: number;
}

export interface ReorderableListProps<T> {
  /** Liste des données à ordonner */
  items?: T[];
  /** Liste initiale non-contrôlée */
  defaultItems?: T[];
  /** Callback fournissant la liste réordonnée */
  onReorder?: (items: T[]) => void;
  /** Extraction d'une clé unique pour chaque élément */
  keyExtractor: (item: T, index: number) => string;
  /** Rendu personnalisé du corps de chaque élément */
  renderItem: (item: T, helpers: ReorderItemHelpers) => React.ReactNode;
  /** Affiche les boutons fléchés accessibles (défaut : true) */
  showControls?: boolean;
  /** Style du conteneur global */
  style?: StyleProp<ViewStyle>;
  /** Style de chaque ligne */
  itemStyle?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

export function ReorderableList<T>({
  items: controlledItems,
  defaultItems = [],
  onReorder,
  keyExtractor,
  renderItem,
  showControls = true,
  style,
  itemStyle,
  className,
}: ReorderableListProps<T>) {
  const { theme } = useTheme();

  const isControlled = controlledItems !== undefined;
  const [internalItems, setInternalItems] = useState<T[]>(defaultItems);
  const items = isControlled ? controlledItems : internalItems;

  const updateOrder = useCallback(
    (newItems: T[]) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (!isControlled) {
        setInternalItems(newItems);
      }
      onReorder?.(newItems);
    },
    [isControlled, onReorder]
  );

  const move = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= items.length) return;

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      const updated = [...items];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      updateOrder(updated);
    },
    [items, updateOrder]
  );

  return (
    <View className={className} style={[styles.container, style]}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const key = keyExtractor(item, index);

        const helpers: ReorderItemHelpers = {
          moveUp: () => move(index, index - 1),
          moveDown: () => move(index, index + 1),
          isFirst,
          isLast,
          index,
        };

        return (
          <View
            key={key}
            style={[
              styles.itemRow,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
              },
              itemStyle,
            ]}
          >
            {/* Contenu principal de l'élément */}
            <View style={styles.itemContent}>{renderItem(item, helpers)}</View>

            {/* Contrôles de réorganisation accessibles */}
            {showControls && (
              <View style={styles.controlsColumn}>
                <TouchableOpacity
                  disabled={isFirst}
                  onPress={helpers.moveUp}
                  accessibilityRole="button"
                  accessibilityLabel="Monter cet élément"
                  style={[styles.arrowButton, { opacity: isFirst ? 0.2 : 0.85 }]}
                >
                  <Ionicons name="chevron-up" size={18} color={theme.colors.foreground} />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isLast}
                  onPress={helpers.moveDown}
                  accessibilityRole="button"
                  accessibilityLabel="Descendre cet élément"
                  style={[styles.arrowButton, { opacity: isLast ? 0.2 : 0.85 }]}
                >
                  <Ionicons name="chevron-down" size={18} color={theme.colors.foreground} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default ReorderableList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  itemContent: {
    flex: 1,
  },
  controlsColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  arrowButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
