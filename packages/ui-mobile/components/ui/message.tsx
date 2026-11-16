// @/components/ui/message.tsx

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";

export interface MessageProps {
  children: React.ReactNode;
  avatar?: string | React.ReactNode;
  align?: "left" | "right";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "glass";
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Message({
  children,
  avatar,
  align = "left",
  header,
  footer,
  variant = "default",
  style,
}: MessageProps) {
  const { theme } = useTheme();
  const isRight = align === "right";

  return (
    <View
      style={[
        styles.container,
        isRight && styles.containerRight,
        style,
      ]}
    >
      {avatar && !isRight ? (
        <View style={styles.avatar}>
          {typeof avatar === "string" ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            avatar
          )}
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          { backgroundColor: theme.colors.card },
          variant === "glass" && styles.bubbleGlass,
        ]}
      >
        {header ? <View style={styles.header}>{header}</View> : null}
        <View style={styles.content}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
      {avatar && isRight ? (
        <View style={styles.avatar}>
          {typeof avatar === "string" ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            avatar
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    gap: 8,
  },
  containerRight: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleGlass: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  header: {
    marginBottom: 4,
  },
  content: {},
  footer: {
    marginTop: 4,
  },
});

export default Message;