// @/components/ui/inline-edit.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";

export interface InlineEditProps {
  /** Valeur textuelle contrôlée */
  value?: string;
  /** Valeur textuelle initiale non contrôlée */
  defaultValue?: string;
  /** Callback déclenché lors de la validation avec la nouvelle valeur */
  onSave?: (newValue: string) => void;
  /** Callback déclenché lors de l'annulation */
  onCancel?: () => void;
  /** Placeholder si la valeur est vide */
  placeholder?: string;
  /** Fonction de validation (retourne un string en cas d'erreur ou boolean) */
  validate?: (text: string) => boolean | string;
  /** Désactive la modification */
  disabled?: boolean;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
  /** Libellé d'accessibilité */
  accessibilityLabel?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value: controlledValue,
  defaultValue = "",
  onSave,
  onCancel,
  placeholder = "Appuyez pour modifier...",
  validate,
  disabled = false,
  style,
  className,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftValue, setDraftValue] = useState<string>(currentValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftValue(currentValue);
  }, [currentValue]);

  const handleStartEditing = useCallback(() => {
    if (disabled) return;
    setDraftValue(currentValue);
    setErrorMessage(null);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [disabled, currentValue]);

  const handleSave = useCallback(() => {
    const trimmed = draftValue.trim();

    if (validate) {
      const res = validate(trimmed);
      if (typeof res === "string") {
        setErrorMessage(res);
        return;
      }
      if (res === false) {
        setErrorMessage("Valeur non valide");
        return;
      }
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (!isControlled) {
      setInternalValue(trimmed);
    }
    setIsEditing(false);
    setErrorMessage(null);
    onSave?.(trimmed);
  }, [draftValue, validate, isControlled, onSave]);

  const handleCancel = useCallback(() => {
    setDraftValue(currentValue);
    setIsEditing(false);
    setErrorMessage(null);
    onCancel?.();
  }, [currentValue, onCancel]);

  return (
    <View className={className} style={[styles.container, style]}>
      {isEditing ? (
        <View style={styles.editingWrapper}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.card,
                borderColor: errorMessage
                  ? theme.colors.destructive
                  : theme.colors.primary,
                borderRadius: theme.borderRadius.sm,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={draftValue}
              onChangeText={(text) => {
                setDraftValue(text);
                if (errorMessage) setErrorMessage(null);
              }}
              onSubmitEditing={handleSave}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.mutedForeground}
              style={[
                styles.textInput,
                { color: theme.colors.foreground, fontSize: theme.typography.base },
              ]}
            />

            <TouchableOpacity
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Valider la modification"
              style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Annuler la modification"
              style={[styles.actionBtn, { backgroundColor: theme.colors.muted }]}
            >
              <Ionicons name="close" size={16} color={theme.colors.foreground} />
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <ThemedText variant="xs" color="destructive">
              {errorMessage}
            </ThemedText>
          )}
        </View>
      ) : (
        <TouchableOpacity
          disabled={disabled}
          onPress={handleStartEditing}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? `Modifier : ${currentValue || placeholder}`}
          style={[
            styles.viewContainer,
            {
              backgroundColor: "transparent",
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.displayText,
              {
                color: currentValue ? theme.colors.foreground : theme.colors.mutedForeground,
                fontSize: theme.typography.base,
              },
            ]}
          >
            {currentValue || placeholder}
          </Text>
          {!disabled && (
            <Ionicons
              name="pencil-outline"
              size={15}
              color={theme.colors.mutedForeground}
              style={styles.pencilIcon}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InlineEdit;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  editingWrapper: {
    width: "100%",
    gap: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    minHeight: 42,
  },
  textInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    ...(Platform.OS === "web" && {
      outlineStyle: "none" as unknown as TextStyle[keyof TextStyle],
      outlineWidth: 0,
      borderWidth: 0,
    }),
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  viewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
    alignSelf: "flex-start",
  },
  displayText: {
    fontWeight: "500",
  },
  pencilIcon: {
    marginLeft: 2,
  },
});
