// @/components/templates/settings/types.ts

export type ThemeModeOption = 'system' | 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  description?: string;
  onPress?: () => void;
}

export interface SettingsTemplateProps {
  profile?: UserProfile;
  sections?: SettingsSection[];
  themeMode?: ThemeModeOption;
  notificationsEnabled?: boolean;
  liquidGlassEnabled?: boolean;
  onThemeModeChange?: (mode: ThemeModeOption) => void;
  onToggleNotifications?: (value: boolean) => void;
  onToggleLiquidGlass?: (value: boolean) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}
