// @/components/widgets/activity-feed/activity-feed-widget.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { ActivityFeedWidgetProps, ActivityFeedItem } from "./types";

export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  title,
  subtitle,
  items,
  maxItems = 5,
  showDividers = true,
  onViewAll,
  viewAllLabel = "Voir tout",
  emptyText = "Aucune activité récente",
  loading = false,
  variant = "glass",
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const displayedItems = items.slice(0, maxItems);

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getAmountColor = (type?: string) => {
    switch (type) {
      case "positive":
        return "#10B981";
      case "negative":
        return theme.colors.destructive || "#EF4444";
      default:
        return theme.colors.foreground;
    }
  };

  if (loading) {
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement du flux d'activité ${title}`}
      >
        <Card.Header style={styles.header}>
          <Skeleton width={140} height={18} borderRadius={4} />
          {onViewAll && <Skeleton width={60} height={14} borderRadius={4} />}
        </Card.Header>
        <Card.Content style={styles.content}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={idx} style={styles.row}>
              <Skeleton width={36} height={36} borderRadius={18} style={styles.avatarMargin} />
              <View style={styles.mainInfo}>
                <Skeleton width="60%" height={14} borderRadius={4} />
                <Skeleton width="40%" height={11} borderRadius={3} style={{ marginTop: 4 }} />
              </View>
              <Skeleton width={50} height={14} borderRadius={4} />
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
      accessibilityRole="summary"
    >
      <Card.Header style={styles.header}>
        <View style={styles.titleCol}>
          <ThemedText variant="base" weight="bold" color="foreground">
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText variant="xs" color="mutedForeground">
              {subtitle}
            </ThemedText>
          )}
        </View>

        {onViewAll && (
          <TouchableOpacity
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel={viewAllLabel}
          >
            <ThemedText variant="xs" weight="semibold" color="primary">
              {viewAllLabel}
            </ThemedText>
          </TouchableOpacity>
        )}
      </Card.Header>

      <Card.Content style={styles.content}>
        {displayedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText variant="sm" color="mutedForeground">
              {emptyText}
            </ThemedText>
          </View>
        ) : (
          displayedItems.map((item, index) => {
            const isClickable = Boolean(item.onPress);
            const amountColor = getAmountColor(item.amountType);

            const rowInner = (
              <>
                {item.avatarUrl || item.avatarInitials ? (
                  <Avatar
                    uri={item.avatarUrl}
                    name={item.avatarInitials || item.title}
                    size="sm"
                    style={styles.avatarMargin}
                  />
                ) : item.icon ? (
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                ) : null}

                <View style={styles.mainInfo}>
                  <ThemedText variant="sm" weight="semibold" color="foreground" numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <View style={styles.subInfoRow}>
                    <ThemedText variant="xs" color="mutedForeground" numberOfLines={1}>
                      {item.timestamp}
                    </ThemedText>
                    {item.description && (
                      <>
                        <ThemedText variant="xs" color="mutedForeground">
                          •
                        </ThemedText>
                        <ThemedText
                          variant="xs"
                          color="mutedForeground"
                          numberOfLines={1}
                          style={styles.descText}
                        >
                          {item.description}
                        </ThemedText>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.rightCol}>
                  {item.amount && (
                    <ThemedText
                      variant="sm"
                      weight="bold"
                      style={{ color: amountColor }}
                      numberOfLines={1}
                    >
                      {item.amount}
                    </ThemedText>
                  )}

                  {item.status && (
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      size="sm"
                    >
                      {item.statusLabel || item.status}
                    </Badge>
                  )}
                </View>
              </>
            );

            return (
              <React.Fragment key={item.id}>
                {showDividers && index > 0 && <Divider variant="subtle" style={styles.divider} />}

                {isClickable ? (
                  <TouchableOpacity
                    onPress={item.onPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}, ${item.timestamp}${item.amount ? `, ${item.amount}` : ""}`}
                    style={styles.row}
                  >
                    {rowInner}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.row}>
                    {rowInner}
                  </View>
                )}
              </React.Fragment>
            );
          })
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
  titleCol: {
    flexShrink: 1,
  },
  content: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  avatarMargin: {
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
    justifyContent: "center",
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  descText: {
    flexShrink: 1,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
    gap: 4,
  },
  divider: {
    opacity: 0.5,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActivityFeedWidget;
