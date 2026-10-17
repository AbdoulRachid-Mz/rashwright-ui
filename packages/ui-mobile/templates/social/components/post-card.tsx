// @/components/templates/social/components/post-card.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import type { Post } from "../types";

export interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));
    onLike?.(post.id);
  };

  return (
    <Card variant="glass" style={styles.card}>
      {/* En-tête auteur */}
      <View style={styles.authorRow}>
        <Avatar name={post.authorName} size="md" />
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: theme.colors.foreground }]}>{post.authorName}</Text>
          <Text style={[styles.timestamp, { color: theme.colors.mutedForeground }]}>{post.timestamp}</Text>
        </View>
      </View>

      {/* Contenu du post */}
      <Text style={[styles.content, { color: theme.colors.foreground }]}>{post.content}</Text>

      {/* Actions (Like, Commentaire, Partage) */}
      <View style={[styles.actionsRow, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLike}
          accessibilityRole="button"
          accessibilityLabel={liked ? "Je n'aime plus" : "J'aime"}
        >
          <Text style={[styles.actionIcon, { color: liked ? theme.colors.destructive : theme.colors.mutedForeground }]}>
            {liked ? "♥" : "♡"}
          </Text>
          <Text style={[styles.actionCount, { color: liked ? theme.colors.destructive : theme.colors.mutedForeground }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment?.(post.id)}
          accessibilityRole="button"
          accessibilityLabel="Commenter"
        >
          <Text style={[styles.actionIcon, { color: theme.colors.mutedForeground }]}>💬</Text>
          <Text style={[styles.actionCount, { color: theme.colors.mutedForeground }]}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare?.(post.id)}
          accessibilityRole="button"
          accessibilityLabel="Partager"
        >
          <Text style={[styles.actionIcon, { color: theme.colors.mutedForeground }]}>↗</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 8,
    gap: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default PostCard;
