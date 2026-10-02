// @/components/ui/search-input.tsx
//
// Champ de recherche pré-configuré avec Liquid Glass, bouton effacer animé,
// support de bouton de filtres et indicateur de chargement.

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import TextInput, { TextInputProps } from "./text-input";
import IconButton from "./icon-button";
import LiquidPressable from "./liquid/liquid-pressable";

export interface SearchInputProps extends Omit<TextInputProps, "leftIcon" | "rightIcon"> {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  loading?: boolean;
  onFilterPress?: () => void;
  showFilterButton?: boolean;
  filterActive?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  loading = false,
  onFilterPress,
  showFilterButton = false,
  filterActive = false,
  placeholder = "Rechercher...",
  containerStyle,
  inputStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState("");

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    } else {
      setInternalValue(text);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      setInternalValue("");
      onChangeText?.("");
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          value={currentValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          style={inputStyle}
          leftIcon={
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.mutedForeground}
            />
          }
          rightIcon={
            <View style={styles.rightIcons}>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={styles.spinner}
                />
              )}
              {currentValue.length > 0 && !loading && (
                <LiquidPressable
                  onPress={handleClear}
                  viscosity="soft"
                  style={styles.clearBtn}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.colors.mutedForeground}
                  />
                </LiquidPressable>
              )}
            </View>
          }
          {...props}
        />
      </View>

      {showFilterButton && (
        <IconButton
          icon={<Ionicons name="options-outline" />}
          variant={filterActive ? "default" : "glass"}
          size="md"
          rounded={false}
          onPress={onFilterPress}
          style={styles.filterBtn}
        />
      )}
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  inputContainer: {
    flex: 1,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spinner: {
    marginRight: 2,
  },
  clearBtn: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtn: {
    borderRadius: 10,
  },
});
