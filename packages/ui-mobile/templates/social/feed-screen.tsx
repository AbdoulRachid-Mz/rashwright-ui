// @/components/templates/social/feed-screen.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import { StoryCarousel } from "./components/story-carousel";
import { PostCard } from "./components/post-card";
import type { SocialTemplateProps, Story, Post } from "./types";

const DEMO_STORIES: Story[] = [
  { id: "s-1", userName: "Sarah", hasUnseenStory: true },
  { id: "s-2", userName: "Lucas", hasUnseenStory: true },
  { id: "s-3", userName: "Emma", hasUnseenStory: false },
  { id: "s-4", userName: "Thomas", hasUnseenStory: true },
  { id: "s-5", userName: "Léa", hasUnseenStory: false },
];

const DEMO_POSTS: Post[] = [
  {
    id: "p-1",
    authorId: "u-1",
    authorName: "Sarah Chen",
    timestamp: "Il y a 2h",
    content: "Je viens de tester les nouveaux composants Rashwright UI Mobile sur Expo SDK 58. L'effet Liquid Glass et le reanimated fluide changent tout l'UX ! ✨📱",
    likesCount: 42,
    commentsCount: 8,
    isLiked: true,
  },
  {
    id: "p-2",
    authorId: "u-2",
    authorName: "Alexandre Dupont",
    timestamp: "Il y a 5h",
    content: "Refonte de notre app mobile en cours. Le CLI rs-ui avec son moteur 3-Way Merge et ses templates e-commerce / finance font gagner des semaines de dev.",
    likesCount: 19,
    commentsCount: 3,
    isLiked: false,
  },
];

export function FeedScreen({
  stories = DEMO_STORIES,
  posts = DEMO_POSTS,
  onLikePost,
  onCommentPost,
  onSharePost,
  onSelectStory,
  onNewPost,
  onBack,
}: SocialTemplateProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        {onBack && (
          <Button variant="ghost" size="sm" onPress={onBack} accessibilityLabel="Retour">
            ‹
          </Button>
        )}
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Fil d'Actualité</Text>
        {onNewPost && (
          <Button variant="default" size="sm" onPress={onNewPost} accessibilityLabel="Publier un post">
            + Publier
          </Button>
        )}
      </View>

      {/* Liste des posts avec carrousel de stories en Header */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<StoryCarousel stories={stories} onSelectStory={onSelectStory} />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={onLikePost}
            onComment={onCommentPost}
            onShare={onSharePost}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

export default FeedScreen;
