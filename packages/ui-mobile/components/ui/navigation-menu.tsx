// @/components/ui/navigation-menu.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import * as Haptics from "expo-haptics";

export interface NavigationSubItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  onPress: () => void;
  active?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  icon?: string | React.ReactNode;
  badge?: string;
  items: NavigationSubItem[];
}

export interface NavigationMenuProps {
  sections: NavigationSection[];
  activeId?: string;
  multiple?: boolean;
  defaultExpanded?: string[];
  variant?: "default" | "glass";
  style?: StyleProp<ViewStyle>;
}

export function NavigationMenu({
  sections,
  activeId,
  multiple = false,
  defaultExpanded = [],
  variant = "default",
  style,
}: NavigationMenuProps) {
  const { theme, isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState<string[]>(defaultExpanded);

  const toggleSection = (sectionId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // optional
    }

    setExpandedSections((prev) => {
      const isExpanded = prev.includes(sectionId);
      if (multiple) {
        return isExpanded ? prev.filter((id) => id !== sectionId) : [...prev, sectionId];
      }
      return isExpanded ? [] : [sectionId];
    });
  };

  const isGlass = variant === "glass";
  const glass = isGlass ? createGlassTheme(theme, isDark) : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isGlass && glass ? glass.materials.regular.background : theme.colors.card,
          borderColor: isGlass && glass ? glass.border.subtle : theme.colors.border,
        },
        style,
      ]}
    >
      {sections.map((section, idx) => {
        const isExpanded = expandedSections.includes(section.id);
        const hasBorderTop = idx > 0;

        return (
          <View
            key={section.id}
            style={[
              styles.sectionWrapper,
              hasBorderTop && { borderTopWidth: 1, borderTopColor: theme.colors.border },
            ]}
          >
            {/* Section Header Button */}
            <TouchableOpacity
              onPress={() => toggleSection(section.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              style={styles.sectionHeader}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                {section.icon && (
                  <View style={styles.iconContainer}>
                    {typeof section.icon === "string" ? (
                      <Text style={styles.iconText}>{section.icon}</Text>
                    ) : (
                      section.icon
                    )}
                  </View>
                )}
                <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                  {section.title}
                </Text>
              </View>

              <View style={styles.headerRight}>
                {section.badge && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.primaryForeground }]}>
                      {section.badge}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.chevron,
                    {
                      color: theme.colors.mutedForeground,
                      transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
                    },
                  ]}
                >
                  ›
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sub-items (Expandable) */}
            {isExpanded && (
              <View style={styles.subItemsList}>
                {section.items.map((item) => {
                  const isActive = activeId === item.id || item.active;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        try {
                          Haptics.selectionAsync();
                        } catch {
                          // optional
                        }
                        item.onPress();
                      }}
                      accessibilityRole="menuitem"
                      style={[
                        styles.subItem,
                        isActive && [
                          styles.subItemActive,
                          { backgroundColor: theme.colors.muted },
                        ],
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.subItemContent}>
                        <Text
                          style={[
                            styles.subItemTitle,
                            {
                              color: isActive
                                ? theme.colors.primary
                                : theme.colors.foreground,
                              fontWeight: isActive ? "600" : "400",
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text
                            style={[
                              styles.subItemDescription,
                              { color: theme.colors.mutedForeground },
                            ]}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>

                      {item.badge && (
                        <View style={[styles.itemBadge, { backgroundColor: theme.colors.muted }]}>
                          <Text style={[styles.itemBadgeText, { color: theme.colors.foreground }]}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
  },
  sectionWrapper: {
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 22,
  },
  subItemsList: {
    paddingLeft: 44,
    paddingRight: 16,
    paddingBottom: 10,
    gap: 4,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  subItemActive: {
    borderRadius: 8,
  },
  subItemContent: {
    flex: 1,
  },
  subItemTitle: {
    fontSize: 14,
  },
  subItemDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default NavigationMenu;
