// @/components/ui/command.tsx

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import * as Haptics from "expo-haptics";

export interface CommandItemProps {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string | React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandGroupProps {
  heading: string;
  children: React.ReactNode;
}

export interface CommandProps {
  placeholder?: string;
  search?: string;
  onSearchChange?: (text: string) => void;
  children: React.ReactNode;
  variant?: "default" | "glass";
  style?: StyleProp<ViewStyle>;
}

export interface CommandDialogProps extends CommandProps {
  visible: boolean;
  onClose: () => void;
}

// ── Context pour le filtrage interne ──────────────────────────────────────────
interface CommandContextValue {
  searchQuery: string;
  variant: "default" | "glass";
}

const CommandContext = React.createContext<CommandContextValue>({
  searchQuery: "",
  variant: "default",
});

export function Command({
  placeholder = "Rechercher une commande...",
  search: controlledSearch,
  onSearchChange,
  children,
  variant = "default",
  style,
}: CommandProps) {
  const { theme, isDark } = useTheme();
  const [internalSearch, setInternalSearch] = useState("");
  const isControlled = controlledSearch !== undefined;
  const searchQuery = isControlled ? controlledSearch : internalSearch;

  const handleSearchChange = (text: string) => {
    if (!isControlled) {
      setInternalSearch(text);
    }
    onSearchChange?.(text);
  };

  const isGlass = variant === "glass";
  const glass = isGlass ? createGlassTheme(theme, isDark) : null;

  return (
    <CommandContext.Provider value={{ searchQuery, variant }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isGlass && glass ? glass.materials.regular.background : theme.colors.card,
            borderColor: isGlass && glass ? glass.border.subtle : theme.colors.border,
          },
          style,
        ]}
      >
        {/* Search input header */}
        <View
          style={[
            styles.inputRow,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: theme.colors.mutedForeground }]}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.mutedForeground}
            style={[styles.input, { color: theme.colors.foreground }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearchChange("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearBtn, { color: theme.colors.mutedForeground }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content list */}
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </CommandContext.Provider>
  );
}

export function CommandGroup({ heading, children }: CommandGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.groupHeading, { color: theme.colors.mutedForeground }]}>
        {heading}
      </Text>
      {children}
    </View>
  );
}

export function CommandItem({
  label,
  sublabel,
  icon,
  shortcut,
  onSelect,
  disabled = false,
}: CommandItemProps) {
  const { theme } = useTheme();
  const { searchQuery } = React.useContext(CommandContext);

  const isVisible = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      label.toLowerCase().includes(q) ||
      (sublabel && sublabel.toLowerCase().includes(q))
    );
  }, [searchQuery, label, sublabel]);

  if (!isVisible) return null;

  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional
    }
    onSelect();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      style={[
        styles.item,
        {
          backgroundColor: "transparent",
          opacity: disabled ? 0.4 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.itemIconContainer}>
          {typeof icon === "string" ? (
            <Text style={styles.itemIconText}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}

      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemLabel, { color: theme.colors.foreground }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.itemSublabel, { color: theme.colors.mutedForeground }]}>
            {sublabel}
          </Text>
        )}
      </View>

      {shortcut && (
        <View style={[styles.shortcutBadge, { backgroundColor: theme.colors.muted }]}>
          <Text style={[styles.shortcutText, { color: theme.colors.mutedForeground }]}>
            {shortcut}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function CommandEmpty({ children = "Aucun résultat trouvé." }: { children?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
        {children}
      </Text>
    </View>
  );
}

export function CommandDialog({
  visible,
  onClose,
  children,
  placeholder,
  variant = "glass",
  style,
}: CommandDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.dialogBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.dialogModalWrapper, style]}
          onPress={(e) => e.stopPropagation()}
        >
          <Command placeholder={placeholder} variant={variant}>
            {children}
          </Command>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: 380,
    width: "100%",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  list: {
    flexGrow: 0,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  group: {
    marginBottom: 8,
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 12,
  },
  itemIconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconText: {
    fontSize: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  shortcutBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shortcutText: {
    fontSize: 11,
    fontFamily: "monospace",
  },
  emptyContainer: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dialogModalWrapper: {
    width: "100%",
    maxWidth: 480,
  },
});

export default Command;
