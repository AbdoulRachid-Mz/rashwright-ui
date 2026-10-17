// @/components/templates/chat/conversation-screen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { ChatBubble } from "./components/chat-bubble";
import { ChatInput } from "./components/chat-input";
import type { ChatMessage, ChatUser, ChatTemplateProps } from "./types";

const DEMO_USER: ChatUser = {
  id: "user-2",
  name: "Camille Laurent",
  isOnline: true,
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    senderId: "user-2",
    senderName: "Camille Laurent",
    text: "Bonjour ! Bienvenue dans Rashwright UI Mobile 👋",
    timestamp: "10:14",
    isMe: false,
  },
  {
    id: "m-2",
    senderId: "me",
    senderName: "Moi",
    text: "Merci ! La fluidité des animations et le mode Liquid Glass sont impressionnants !",
    timestamp: "10:15",
    isMe: true,
  },
  {
    id: "m-3",
    senderId: "user-2",
    senderName: "Camille Laurent",
    text: "Exactement, tout est pensé pour fonctionner à 60 FPS natif sur iOS et Android.",
    timestamp: "10:16",
    isMe: false,
  },
];

export function ConversationScreen({ user = DEMO_USER, messages: initialList = INITIAL_MESSAGES, onSendMessage, onBack }: ChatTemplateProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(initialList);

  const handleSend = (text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      senderName: "Moi",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    onSendMessage?.(text);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête de conversation */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        {onBack && (
          <Button variant="ghost" size="sm" onPress={onBack} accessibilityLabel="Retour">
            ‹
          </Button>
        )}
        <Avatar name={user.name} size="md" />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.foreground }]}>{user.name}</Text>
          <View style={styles.statusRow}>
            {user.isOnline ? (
              <Badge variant="default" style={styles.onlineBadge}>En ligne</Badge>
            ) : (
              <Text style={[styles.statusText, { color: theme.colors.mutedForeground }]}>Hors ligne</Text>
            )}
          </View>
        </View>
      </View>

      {/* Liste des messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
      />

      {/* Barre de saisie */}
      <ChatInput onSend={handleSend} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusRow: {
    marginTop: 2,
  },
  onlineBadge: {
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
  },
  messageList: {
    paddingVertical: 16,
  },
});

export default ConversationScreen;
