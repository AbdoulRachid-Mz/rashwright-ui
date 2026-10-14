// @/components/templates/settings/settings-template.tsx

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Card from '@/components/ui/card';
import Divider from '@/components/ui/divider';
import Button from '@/components/ui/button';
import RashwrightLogo from '@/components/ui/rashwright-logo';
import { useTheme } from '@/contexts/theme-context';
import { ProfileSection } from './components/profile-section';
import { PreferencesSection } from './components/preferences-section';
import type { SettingsTemplateProps, SettingsSection, UserProfile } from './types';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Martin',
  email: 'alex@exemple.com',
  role: 'Développeur',
};

const DEFAULT_SECTIONS: SettingsSection[] = [
  { id: 'privacy',   title: 'Confidentialité', icon: '🔒' },
  { id: 'security',  title: 'Sécurité',         icon: '🛡️' },
  { id: 'language',  title: 'Langue',            icon: '🌐' },
  { id: 'support',   title: 'Aide & Support',    icon: '❓' },
  { id: 'about',     title: 'À propos',          icon: 'ℹ️' },
];

export function SettingsTemplate({
  profile = DEFAULT_PROFILE,
  sections = DEFAULT_SECTIONS,
  isDarkMode: isDarkModeProp,
  notificationsEnabled: notificationsEnabledProp,
  onToggleDarkMode,
  onToggleNotifications,
  onEditProfile,
  onLogout,
}: SettingsTemplateProps) {
  const { theme } = useTheme();

  const [darkMode, setDarkMode] = useState<boolean>(isDarkModeProp ?? false);
  const [notifications, setNotifications] = useState<boolean>(notificationsEnabledProp ?? true);

  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    onToggleDarkMode?.(value);
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotifications(value);
    onToggleNotifications?.(value);
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Paramètres</Text>
        <RashwrightLogo />
      </View>

      {/* Profile */}
      <ProfileSection profile={profile} onEditProfile={onEditProfile} />

      <Divider style={styles.divider} />

      {/* Preferences */}
      <Text style={[styles.sectionLabel, { color: theme.colors.mutedForeground }]}>
        Préférences
      </Text>
      <PreferencesSection
        isDarkMode={darkMode}
        notificationsEnabled={notifications}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleNotifications={handleToggleNotifications}
      />

      <Divider style={styles.divider} />

      {/* Other settings */}
      <Text style={[styles.sectionLabel, { color: theme.colors.mutedForeground }]}>
        Autres réglages
      </Text>
      {sections.map((section) => (
        <TouchableOpacity
          key={section.id}
          onPress={section.onPress}
          activeOpacity={0.7}
          style={styles.sectionItem}
        >
          <Card  style={styles.sectionCard}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                {section.title}
              </Text>
              <Text style={[styles.chevron, { color: theme.colors.mutedForeground }]}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <Button
        variant="destructive"
        onPress={onLogout ?? (() => console.log('logout'))}
        style={styles.logoutButton}
      >
        Se déconnecter
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  divider: {
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionItem: {
    marginBottom: 8,
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default SettingsTemplate;
