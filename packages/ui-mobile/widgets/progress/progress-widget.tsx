// @/components/widgets/progress/progress-widget.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { ProgressWidgetProps } from "./types";

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  current,
  target = 100,
  unit = "",
  description,
  completedLabel = "Objectif atteint !",
  showPercentage = true,
  barHeight = 8,
  icon,
  loading = false,
  variant = "glass",
  onPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const safeTarget = target > 0 ? target : 100;
  const safeCurrent = Math.max(0, current);
  const percentage = Math.round((safeCurrent / safeTarget) * 100);
  const isCompleted = percentage >= 100;

  const progressVariant = isCompleted ? "success" : percentage >= 75 ? "default" : percentage >= 40 ? "warning" : "default";

  const a11yLabel = `${title}: ${safeCurrent}${unit ? ` ${unit}` : ""} sur ${safeTarget}${unit ? ` ${unit}` : ""} (${percentage}%)${isCompleted ? `, ${completedLabel}` : ""}`;

  if (loading) {
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement de la progression ${title}`}
      >
        <Card.Header style={styles.header}>
          <Skeleton width="55%" height={16} borderRadius={4} />
          <Skeleton width={38} height={20} borderRadius={10} />
        </Card.Header>
        <Card.Content style={styles.content}>
          <Skeleton width="40%" height={24} borderRadius={4} />
          <Skeleton width="100%" height={barHeight} borderRadius={barHeight / 2} style={styles.barSkeleton} />
          <Skeleton width="60%" height={14} borderRadius={4} />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole={onPress ? "button" : "progressbar"}
      accessibilityValue={{ min: 0, max: safeTarget, now: safeCurrent }}
      accessibilityLabel={a11yLabel}
    >
      <Card.Header style={styles.header}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText variant="sm" color="mutedForeground" weight="medium" numberOfLines={1}>
            {title}
          </ThemedText>
        </View>

        {showPercentage && (
          <Badge
            variant={isCompleted ? "success" : "secondary"}
            size="sm"
            icon={isCompleted ? <Ionicons name="checkmark-circle" size={12} color="#10B981" /> : undefined}
          >
            {`${percentage}%`}
          </Badge>
        )}
      </Card.Header>

      <Card.Content style={styles.content}>
        <View style={styles.valueRow}>
          <ThemedText variant="xl" weight="bold" color="foreground">
            {`${safeCurrent}${unit ? ` ${unit}` : ""}`}
          </ThemedText>
          <ThemedText variant="sm" color="mutedForeground">
            {`/ ${safeTarget}${unit ? ` ${unit}` : ""}`}
          </ThemedText>
        </View>

        <Progress
          value={safeCurrent}
          max={safeTarget}
          variant={progressVariant}
          height={barHeight}
          style={styles.progressBar}
        />

        {(isCompleted || description) && (
          <ThemedText
            variant="xs"
            color={isCompleted ? "primary" : "mutedForeground"}
            weight={isCompleted ? "semibold" : "normal"}
            numberOfLines={1}
            style={styles.descriptionText}
          >
            {isCompleted ? completedLabel : description}
          </ThemedText>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  progressBar: {
    marginVertical: 4,
  },
  barSkeleton: {
    marginVertical: 6,
  },
  descriptionText: {
    marginTop: 2,
  },
});

export default ProgressWidget;
