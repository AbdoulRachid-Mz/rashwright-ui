// @/components/templates/settings/types.ts

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon: string;       // emoji or text icon
  description?: string;
  onPress?: () => void;
}

export interface SettingsTemplateProps {
  profile?: UserProfile;
  sections?: SettingsSection[];
  isDarkMode?: boolean;
  notificationsEnabled?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
  onToggleNotifications?: (value: boolean) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}
