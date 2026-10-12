// @/components/templates/settings/components/preferences-section.tsx

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Card from '@/components/ui/card';
import Divider from '@/components/ui/divider';
import { useTheme } from '@/contexts/theme-context';

interface PreferencesSectionProps {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  onToggleDarkMode: (v: boolean) => void;
  onToggleNotifications: (v: boolean) => void;
}

export function PreferencesSection({
  isDarkMode,
  notificationsEnabled,
  onToggleDarkMode,
  onToggleNotifications,
}: PreferencesSectionProps) {
  const { theme } = useTheme();

  return (
    <Card variant="glass" style={styles.card}>
      {/* Dark mode row */}
      <View style={styles.row}>
        <Text style={styles.icon}>🌙</Text>
        <Text style={[styles.label, { color: theme.colors.foreground }]}>Mode sombre</Text>
        <Switch
          value={isDarkMode}
          onValueChange={onToggleDarkMode}
          trackColor={{
            false: theme.colors.muted,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background}
        />
      </View>

      <Divider />

      {/* Notifications row */}
      <View style={styles.row}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={[styles.label, { color: theme.colors.foreground }]}>Notifications</Text>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
});
