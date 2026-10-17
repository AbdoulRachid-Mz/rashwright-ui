// @/components/templates/social/components/story-carousel.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Avatar from "@/components/ui/avatar";
import type { Story } from "../types";

export interface StoryCarouselProps {
  stories: Story[];
  onSelectStory?: (id: string) => void;
}

export function StoryCarousel({ stories, onSelectStory }: StoryCarouselProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {stories.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={styles.storyItem}
          onPress={() => onSelectStory?.(story.id)}
          accessibilityRole="button"
          accessibilityLabel={`Story de ${story.userName}`}
        >
          <View
            style={[
              styles.avatarRing,
              {
                borderColor: story.hasUnseenStory ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Avatar name={story.userName} size="lg" />
          </View>
          <Text
            style={[styles.userName, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {story.userName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  storyItem: {
    alignItems: "center",
    width: 68,
    gap: 6,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
  },
  userName: {
    fontSize: 11,
    textAlign: "center",
  },
});

export default StoryCarousel;
