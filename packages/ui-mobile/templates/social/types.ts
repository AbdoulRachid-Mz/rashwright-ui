// @/components/templates/social/types.ts

export interface Story {
  id: string;
  userName: string;
  userAvatar?: string;
  hasUnseenStory?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface SocialTemplateProps {
  stories?: Story[];
  posts?: Post[];
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  onSharePost?: (postId: string) => void;
  onSelectStory?: (storyId: string) => void;
  onNewPost?: () => void;
  onBack?: () => void;
}
