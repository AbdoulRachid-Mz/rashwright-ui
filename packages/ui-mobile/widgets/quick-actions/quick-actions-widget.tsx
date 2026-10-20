// @/components/widgets/quick-actions/quick-actions-widget.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { QuickActionsWidgetProps, QuickActionItem } from "./types";

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  title,
  actions,
  columns = 4,
  variant = "glass",
  loading = false,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const handlePress = async (action: QuickActionItem) => {
    if (action.disabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics indisponible (ex: simulateur web)
    }
    action.onPress();
  };

  const columnWidthPercent = `${Math.floor(100 / columns)}%` as const;

  if (loading) {
    const dummySkeletons = Array.from({ length: columns });
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement des actions rapides`}
      >
        {title && (
          <Card.Header style={styles.header}>
            <Skeleton width="40%" height={16} borderRadius={4} />
          </Card.Header>
        )}
        <Card.Content style={styles.grid}>
          {dummySkeletons.map((_, idx) => (
            <View key={idx} style={[styles.actionWrapper, { width: columnWidthPercent }]}>
              <Skeleton width={48} height={48} borderRadius={24} style={styles.iconSkeleton} />
              <Skeleton width="70%" height={12} borderRadius={4} />
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole="none"
    >
      {title && (
        <Card.Header style={styles.header}>
          <ThemedText variant="sm" color="mutedForeground" weight="medium" numberOfLines={1}>
            {title}
          </ThemedText>
        </Card.Header>
      )}

      <Card.Content style={styles.grid}>
        {actions.map((action) => {
          const actionColor = action.color || theme.colors.primary;
          const bgCircle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";

          return (
            <View
              key={action.id}
              style={[styles.actionWrapper, { width: columnWidthPercent }]}
            >
              <TouchableOpacity
                onPress={() => handlePress(action)}
                disabled={action.disabled}
                activeOpacity={0.7}
                style={[
                  styles.button,
                  { backgroundColor: bgCircle },
                  action.disabled && styles.buttonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                accessibilityState={{ disabled: action.disabled }}
              >
                {action.customIcon ? (
                  action.customIcon
                ) : (
                  <Ionicons
                    name={action.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={action.disabled ? theme.colors.mutedForeground : actionColor}
                  />
                )}

                {action.badge !== undefined && (
                  <View style={styles.badgeAnchor}>
                    <Badge variant="destructive" size="sm" rounded>
                      {action.badge}
                    </Badge>
                  </View>
                )}
              </TouchableOpacity>

              <ThemedText
                variant="xs"
                weight="medium"
                color={action.disabled ? "mutedForeground" : "foreground"}
                numberOfLines={1}
                style={[styles.label, { textAlign: "center" }]}
              >
                {action.label}
              </ThemedText>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    rowGap: 14,
  },
  actionWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  badgeAnchor: {
    position: "absolute",
    top: -4,
    right: -6,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  iconSkeleton: {
    marginBottom: 6,
  },
});

export default QuickActionsWidget;
