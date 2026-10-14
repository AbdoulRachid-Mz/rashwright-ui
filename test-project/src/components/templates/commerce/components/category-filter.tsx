// @/components/templates/commerce/components/category-filter.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import Badge from '@/components/ui/badge';
import { useTheme } from '@/contexts/theme-context';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

const ALL_LABEL = 'Tous';

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const { theme } = useTheme();

  const allCategories = [ALL_LABEL, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {allCategories.map((cat) => {
        const isSelected = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => onSelect(cat)}
            style={styles.item}
          >
            <Badge variant={isSelected ? 'default' : 'outline'}>
              {cat}
            </Badge>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  item: {
    // TouchableOpacity hit-slop is handled by Badge padding
  },
});

export default CategoryFilter;
