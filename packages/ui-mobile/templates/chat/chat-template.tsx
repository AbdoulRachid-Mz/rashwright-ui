// @/components/templates/chat/chat-template.tsx
import React from "react";
import ConversationScreen from "./conversation-screen";
import type { ChatTemplateProps } from "./types";

export function ChatTemplate(props: ChatTemplateProps) {
  return <ConversationScreen {...props} />;
}

export default ChatTemplate;
