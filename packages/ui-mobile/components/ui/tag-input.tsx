// @/components/ui/tag-input.tsx
import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";

export interface TagInputProps {
  /** Liste des tags contrôlée */
  tags?: string[];
  /** Liste des tags initiale non-contrôlée */
  defaultTags?: string[];
  /** Callback déclenché à chaque ajout ou suppression */
  onTagsChange?: (tags: string[]) => void;
  /** Placeholder affiché dans le champ de saisie */
  placeholder?: string;
  /** Libellé optionnel au-dessus du champ */
  label?: string;
  /** Nombre maximum de tags autorisés */
  maxTags?: number;
  /** Longueur maximale de chaque tag en caractères */
  maxTagLength?: number;
  /** Autorise ou interdit les doublons (défaut : false) */
  allowDuplicates?: boolean;
  /** Caractères déclencheurs de séparation (défaut : [",", "Enter"]) */
  separators?: string[];
  /** Supprime le dernier tag au Backspace si le champ est vide (défaut : true) */
  backspaceDeletesLastTag?: boolean;
  /** Fonction de validation personnalisée pour chaque tag */
  validateTag?: (tag: string) => boolean | string;
  /** Message d'erreur externe */
  error?: boolean | string;
  /** Texte d'aide */
  hint?: string;
  /** Désactive la saisie */
  disabled?: boolean;
  /** Variante visuelle */
  variant?: "default" | "glass" | "outline";
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags: controlledTags,
  defaultTags = [],
  onTagsChange,
  placeholder = "Ajouter un tag...",
  label,
  maxTags,
  maxTagLength,
  allowDuplicates = false,
  separators = [",", "Enter"],
  backspaceDeletesLastTag = true,
  validateTag,
  error: externalError,
  hint,
  disabled = false,
  variant = "default",
  style,
  className,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const isControlled = controlledTags !== undefined;
  const [internalTags, setInternalTags] = useState<string[]>(defaultTags);
  const tags = isControlled ? controlledTags : internalTags;

  const [inputValue, setInputValue] = useState<string>("");
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const updateTags = useCallback(
    (newTags: string[]) => {
      if (!isControlled) {
        setInternalTags(newTags);
      }
      onTagsChange?.(newTags);
    },
    [isControlled, onTagsChange]
  );

  const addTag = useCallback(
    (rawText: string) => {
      const cleanTag = rawText.trim();
      if (!cleanTag) return;

      if (maxTagLength && cleanTag.length > maxTagLength) {
        setInternalError(`Le tag ne peut pas dépasser ${maxTagLength} caractères`);
        return;
      }

      if (maxTags && tags.length >= maxTags) {
        setInternalError(`Limite de ${maxTags} tags atteinte`);
        return;
      }

      if (!allowDuplicates && tags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
        setInternalError("Ce tag existe déjà");
        return;
      }

      if (validateTag) {
        const valRes = validateTag(cleanTag);
        if (typeof valRes === "string") {
          setInternalError(valRes);
          return;
        }
        if (valRes === false) {
          setInternalError("Tag non valide");
          return;
        }
      }

      setInternalError(null);
      const nextTags = [...tags, cleanTag];
      updateTags(nextTags);
      setInputValue("");
    },
    [tags, maxTags, maxTagLength, allowDuplicates, validateTag, updateTags]
  );

  const removeTag = useCallback(
    (indexToRemove: number) => {
      if (disabled) return;
      const nextTags = tags.filter((_, idx) => idx !== indexToRemove);
      updateTags(nextTags);
      setInternalError(null);
    },
    [tags, disabled, updateTags]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      // Vérifier si un des séparateurs est tapé
      for (const sep of separators) {
        if (sep !== "Enter" && text.includes(sep)) {
          const parts = text.split(sep);
          const toAdd = parts[0];
          addTag(toAdd);
          return;
        }
      }
      setInputValue(text);
      if (internalError) setInternalError(null);
    },
    [separators, addTag, internalError]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = e.nativeEvent.key;

      if (key === "Backspace" && inputValue === "" && backspaceDeletesLastTag && tags.length > 0) {
        removeTag(tags.length - 1);
      } else if (key === "Enter") {
        addTag(inputValue);
      }
    },
    [inputValue, backspaceDeletesLastTag, tags, removeTag, addTag]
  );

  const glass = React.useMemo(() => createGlassTheme(theme, isDark), [theme, isDark]);

  const errorMessage = typeof externalError === "string" ? externalError : internalError;
  const hasError = Boolean(externalError || internalError);

  const containerBg =
    variant === "glass" && liquidGlassEnabled
      ? glass.materials.soft.background
      : theme.colors.card;

  const borderColor = hasError
    ? theme.colors.destructive
    : isFocused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label && (
        <ThemedText variant="sm" weight="medium" color={hasError ? "destructive" : "foreground"}>
          {label}
        </ThemedText>
      )}

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.container,
          {
            backgroundColor: containerBg,
            borderColor,
            borderWidth: isFocused || hasError ? 1.5 : 1,
            borderRadius: theme.borderRadius.md,
          },
        ]}
      >
        {tags.map((tag, index) => (
          <View
            key={`${tag}-${index}`}
            style={[
              styles.tagPill,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                borderRadius: theme.borderRadius.sm,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: theme.colors.foreground }]}>{tag}</Text>
            {!disabled && (
              <TouchableOpacity
                onPress={() => removeTag(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer le tag ${tag}`}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={14} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {(!maxTags || tags.length < maxTags) && !disabled && (
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={handleChangeText}
            onKeyPress={handleKeyPress}
            onSubmitEditing={() => addTag(inputValue)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (inputValue.trim()) {
                addTag(inputValue);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            placeholderTextColor={theme.colors.mutedForeground}
            style={[
              styles.input,
              {
                color: theme.colors.foreground,
              },
            ]}
          />
        )}
      </TouchableOpacity>

      {errorMessage && (
        <ThemedText variant="xs" color="destructive">
          {errorMessage}
        </ThemedText>
      )}

      {!errorMessage && hint && (
        <ThemedText variant="xs" color="mutedForeground">
          {hint}
        </ThemedText>
      )}
    </View>
  );
};

export default TagInput;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 6,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: 8,
    gap: 6,
    minHeight: 48,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  removeButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minWidth: 90,
    height: 32,
    fontSize: 14,
    padding: 0,
    margin: 0,
    ...(Platform.OS === "web" && {
      outlineStyle: "none" as unknown as TextStyle[keyof TextStyle],
      outlineWidth: 0,
      borderWidth: 0,
    }),
  },
});
