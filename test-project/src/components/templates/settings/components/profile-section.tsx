// @/components/templates/settings/components/profile-section.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/card';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { UserProfile } from '../types';

interface ProfileSectionProps {
  profile: UserProfile;
  onEditProfile?: () => void;
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
  },
  container: {
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    marginTop: 2,
  },
  editButton: {
    marginTop: 8,
  },
});

export function ProfileSection({ profile, onEditProfile }: ProfileSectionProps) {
  return (
    <Card variant="glass" style={styles.card}>
      <View style={styles.container}>
        <Avatar
          size="lg"
          name={profile.name}
          source={profile.avatarUrl ? { uri: profile.avatarUrl } : undefined}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <Badge variant="outline" style={styles.badge}>
          {profile.role}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onPress={onEditProfile}
          style={styles.editButton}
        >
          Modifier le profil
        </Button>
      </View>
    </Card>
  );
}
