// @/components/ui/expandable-text.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  TextLayoutEventData,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ExpandableTextProps {
  /** Texte à afficher */
  children: string;
  /** Nombre maximal de lignes avant tronquage (défaut : 3) */
  maxLines?: number;
  /** Libellé du bouton pour déplier le texte (défaut : "Voir plus") */
  expandText?: string;
  /** Libellé du bouton pour replier le texte (défaut : "Voir moins") */
  collapseText?: string;
  /** Variante typographique du texte */
  variant?: "xs" | "sm" | "base" | "lg" | "xl";
  /** Couleur spécifique pour le lien de bascule */
  actionColor?: string;
  /** Autorise la réduction après avoir déplié (défaut : true) */
  allowCollapse?: boolean;
  /** État initialement déplié (défaut : false) */
  defaultExpanded?: boolean;
  /** Callback lors du changement d'état */
  onExpandChange?: (expanded: boolean) => void;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Style du texte */
  textStyle?: StyleProp<TextStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  children,
  maxLines = 3,
  expandText = "Voir plus",
  collapseText = "Voir moins",
  variant = "base",
  actionColor,
  allowCollapse = true,
  defaultExpanded = false,
  onExpandChange,
  style,
  textStyle,
  className,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [shouldShowButton, setShouldShowButton] = useState<boolean>(false);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !isExpanded;
    setIsExpanded(next);
    onExpandChange?.(next);
  }, [isExpanded, onExpandChange]);

  const handleTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (e.nativeEvent.lines.length > maxLines) {
        setShouldShowButton(true);
      }
    },
    [maxLines]
  );

  const linkColor = actionColor ?? theme.colors.primary;
  const fontSize = theme.typography[variant] ?? theme.typography.base;

  return (
    <View className={className} style={[styles.container, style]}>
      <Text
        numberOfLines={isExpanded ? undefined : maxLines}
        onTextLayout={handleTextLayout}
        style={[
          styles.text,
          {
            fontSize,
            lineHeight: fontSize * 1.5,
            color: theme.colors.foreground,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>

      {shouldShowButton && (isExpanded ? allowCollapse : true) && (
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? collapseText : expandText}
          accessibilityHint="Affiche ou masque l'intégralité du texte"
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: linkColor }]}>
            {isExpanded ? collapseText : expandText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ExpandableText;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  text: {
    fontWeight: "400",
  },
  actionButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
  },
});
