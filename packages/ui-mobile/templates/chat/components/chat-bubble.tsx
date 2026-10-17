// @/components/templates/chat/components/chat-bubble.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import type { ChatMessage } from "../types";

export interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { theme } = useTheme();
  const isMe = message.isMe;

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      <Card
        variant={isMe ? "default" : "glass"}
        style={[
          styles.bubble,
          isMe
            ? { backgroundColor: theme.colors.primary, borderBottomRightRadius: 2 }
            : { borderBottomLeftRadius: 2 },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isMe ? theme.colors.primaryForeground : theme.colors.foreground },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: isMe ? "rgba(255,255,255,0.7)" : theme.colors.mutedForeground },
          ]}
        >
          {message.timestamp}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
});

export default ChatBubble;
