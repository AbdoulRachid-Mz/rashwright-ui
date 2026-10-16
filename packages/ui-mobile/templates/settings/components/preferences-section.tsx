// @/components/templates/settings/components/preferences-section.tsx

import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '@/components/ui/card';
import Divider from '@/components/ui/divider';
import { useTheme } from '@/contexts/theme-context';
import type { ThemeModeOption } from '../types';

interface PreferencesSectionProps {
  themeMode: ThemeModeOption;
  notificationsEnabled: boolean;
  liquidGlassEnabled: boolean;
  onThemeModeChange: (mode: ThemeModeOption) => void;
  onToggleNotifications: (v: boolean) => void;
  onToggleLiquidGlass: (v: boolean) => void;
}

const THEME_OPTIONS: { id: ThemeModeOption; label: string; icon: string }[] = [
  { id: 'system', label: 'Système', icon: '🖥️' },
  { id: 'light',  label: 'Clair',   icon: '☀️' },
  { id: 'dark',   label: 'Sombre',  icon: '🌙' },
];

export function PreferencesSection({
  themeMode,
  notificationsEnabled,
  liquidGlassEnabled,
  onThemeModeChange,
  onToggleNotifications,
  onToggleLiquidGlass,
}: PreferencesSectionProps) {
  const { theme } = useTheme();

  return (
    <Card variant="glass" style={styles.card}>
      {/* Theme Mode 3-option selector */}
      <View style={styles.themeSelectorSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.icon}>🎨</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            Apparence
          </Text>
        </View>

        <View style={styles.segmentedContainer}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themeMode === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onThemeModeChange(opt.id)}
                activeOpacity={0.7}
                style={[
                  styles.segmentButton,
                  isSelected && [
                    styles.segmentButtonActive,
                    { backgroundColor: theme.colors.primary },
                  ],
                ]}
              >
                <Text style={styles.segmentIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.segmentLabel,
                    {
                      color: isSelected
                        ? theme.colors.primaryForeground
                        : theme.colors.mutedForeground,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Divider />

      {/* Notifications row */}
      <View style={styles.row}>
        <Text style={styles.icon}>🔔</Text>
        <View style={styles.rowInfo}>
          <Text style={[styles.label, { color: theme.colors.foreground }]}>
            Notifications push
          </Text>
          <Text style={[styles.sublabel, { color: theme.colors.mutedForeground }]}>
            Recevoir les alertes et mises à jour
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={onToggleNotifications}
          trackColor={{
            false: theme.colors.muted,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background}
        />
      </View>

      <Divider />

      {/* Liquid Glass row */}
      <View style={styles.row}>
        <Text style={styles.icon}>✨</Text>
        <View style={styles.rowInfo}>
          <Text style={[styles.label, { color: theme.colors.foreground }]}>
            Effet Liquid Glass
          </Text>
          <Text style={[styles.sublabel, { color: theme.colors.mutedForeground }]}>
            Reflets et transparences avancées
          </Text>
        </View>
        <Switch
          value={liquidGlassEnabled}
          onValueChange={onToggleLiquidGlass}
          trackColor={{
            false: theme.colors.muted,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  themeSelectorSection: {
    paddingVertical: 10,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  segmentedContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.25)',
  },
  segmentButtonActive: {
    borderColor: 'transparent',
  },
  segmentIcon: {
    fontSize: 14,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  sublabel: {
    fontSize: 12,
  },
});
