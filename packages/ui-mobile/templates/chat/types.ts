// @/components/templates/chat/types.ts

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatTemplateProps {
  user?: ChatUser;
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
  onBack?: () => void;
}
