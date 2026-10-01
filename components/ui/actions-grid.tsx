// @/components/ui/actions-grid.tsx
import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TextStyle,
  Dimensions,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import { Carousel } from "./carousel";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";

export interface ActionItem {
  id: string;
  label: string;
  icon: string;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
  badge?: string | number;
  disabled?: boolean;
}

export interface ActionsGridProps {
  actions: ActionItem[];
  title?: string;
  subtitle?: string;
  layout?: "carousel" | "grid" | "scroll";
  columns?: number;
  itemsPerView?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  cardStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  compact?: boolean;
  variant?: "default" | "premium" | "minimal";
  onActionPress?: (action: ActionItem) => void;
}

export const ActionsGrid: React.FC<ActionsGridProps> = ({
  actions,
  title,
  subtitle,
  layout = "grid",
  columns = 4,
  itemsPerView = 4,
  showIndicators = false,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  cardStyle,
  textStyle,
  iconSize = 24,
  compact = false,
  variant = "default",
  onActionPress,
}) => {
  const { theme, isDark } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  const handleActionPress = (action: ActionItem) => {
    if (!action.disabled) {
      onActionPress?.(action);
      action.onPress();
    }
  };

  const renderActionCard = (action: ActionItem) => {
    const color = action.color || theme.colors.primary;
    const bgColor = action.backgroundColor || color + "18";

    const isPremium = variant === "premium";
    const isMinimal = variant === "minimal";

    const cardContent = (
      <LiquidPressable
        key={action.id}
        style={[
          styles.actionCard,
          compact && styles.compactCard,
          cardStyle,
          action.disabled && styles.disabledCard,
        ]}
        onPress={() => handleActionPress(action)}
        disabled={action.disabled}
        viscosity="medium"
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isMinimal ? "transparent" : bgColor },
            compact && styles.compactIconContainer,
          ]}
        >
          <Ionicons
            name={action.icon as any}
            size={compact ? iconSize * 0.8 : iconSize}
            color={color}
          />
          {action.badge && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.destructive,
                },
              ]}
            >
              <ThemedText
                variant="xs"
                style={{ color: "#fff", fontWeight: "700" }}
              >
                {action.badge}
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText
          variant={compact ? "xs" : "sm"}
          weight={isPremium ? "semibold" : "medium"}
          style={[
            styles.actionLabel,
            textStyle,
            compact && styles.compactLabel,
          ]}
          numberOfLines={1}
        >
          {action.label}
        </ThemedText>
      </LiquidPressable>
    );

    if (isPremium) {
      return (
        <LiquidSurface
          key={action.id}
          material="regular"
          borderRadius={theme.borderRadius.lg}
          style={styles.premiumCardWrapper}
        >
          {cardContent}
        </LiquidSurface>
      );
    }

    if (!isMinimal) {
      return (
        <LiquidSurface
          key={action.id}
          material="soft"
          borderRadius={theme.borderRadius.md}
          style={styles.defaultCardWrapper}
        >
          {cardContent}
        </LiquidSurface>
      );
    }

    return cardContent;
  };

  const header = (title || subtitle) && (
    <View style={styles.header}>
      {title && (
        <ThemedText variant="lg" weight="bold">
          {title}
        </ThemedText>
      )}
      {subtitle && (
        <ThemedText variant="sm" color="mutedForeground">
          {subtitle}
        </ThemedText>
      )}
    </View>
  );

  if (layout === "carousel") {
    return (
      <View style={styles.container}>
        {header}
        <Carousel
          data={actions}
          renderItem={(item) => renderActionCard(item)}
          itemsPerView={itemsPerView}
          showIndicators={showIndicators}
          showArrows={showArrows}
          autoPlay={autoPlay}
          autoPlayInterval={autoPlayInterval}
        />
      </View>
    );
  }

  if (layout === "grid") {
    const itemWidth = (screenWidth - 32 - (columns - 1) * 10) / columns;

    return (
      <View style={styles.container}>
        {header}
        <View style={styles.gridContainer}>
          {actions.map((action) => (
            <View
              key={action.id}
              style={{
                width: itemWidth,
                marginBottom: 10,
              }}
            >
              {renderActionCard(action)}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {actions.map((action) => (
          <View key={action.id} style={{ marginRight: 10 }}>
            {renderActionCard(action)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  scrollContainer: {
    paddingHorizontal: 4,
  },
  actionCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "100%",
  },
  defaultCardWrapper: {
    width: "100%",
  },
  premiumCardWrapper: {
    width: "100%",
  },
  compactCard: {
    padding: 6,
  },
  disabledCard: {
    opacity: 0.45,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: "relative",
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
  },
  actionLabel: {
    textAlign: "center",
    fontSize: 12,
  },
  compactLabel: {
    fontSize: 10,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
});