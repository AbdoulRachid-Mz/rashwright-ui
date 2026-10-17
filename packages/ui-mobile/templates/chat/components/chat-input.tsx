// @/components/templates/chat/components/chat-input.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import TextInput from "@/components/ui/text-input";
import Button from "@/components/ui/button";

export interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const { theme } = useTheme();
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Écrivez un message..."
          value={text}
          onChangeText={setText}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
      </View>
      <Button
        variant="default"
        size="sm"
        onPress={handleSend}
        disabled={!text.trim()}
        accessibilityLabel="Envoyer le message"
        style={styles.sendButton}
      >
        Envoyer
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    marginVertical: 0,
  },
  sendButton: {
    minHeight: 40,
    borderRadius: 20,
  },
});

export default ChatInput;
