// @/components/widgets/quick-actions/types.ts

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export interface QuickActionItem {
  /** Identifiant unique de l'action. */
  id: string;
  /** Libellé affiché sous l'icône (ex: "Envoyer", "Recharger", "Scanner"). */
  label: string;
  /** Nom de l'icône Ionicons (ex: "send", "qr-code", "wallet", "add"). */
  icon: string;
  /** Composant d'icône ReactNode alternatif à Ionicons. */
  customIcon?: ReactNode;
  /** Couleur spécifique de l'icône ou de l'arrière-plan du bouton. */
  color?: string;
  /** Badge optionnel affiché sur l'action (ex: "New", 3). */
  badge?: string | number;
  /** Désactive l'action. */
  disabled?: boolean;
  /** Callback exécuté lors du clic sur l'action. */
  onPress: () => void;
}

export interface QuickActionsWidgetProps {
  /** Titre optionnel au-dessus de la grille d'actions (ex: "Raccourcis", "Actions rapides"). */
  title?: string;
  /** Liste des actions à afficher dans la grille. */
  actions: QuickActionItem[];
  /** Nombre de colonnes par ligne (2, 3 ou 4, défaut: 4). */
  columns?: 2 | 3 | 4;
  /** Variante visuelle de la carte conteneur. */
  variant?: "default" | "bordered" | "glass";
  /** État de chargement avec affichage de squelettes. */
  loading?: boolean;
  /** Style personnalisé pour le conteneur racine. */
  style?: StyleProp<ViewStyle>;
  /** Identifiant optionnel pour les tests d'intégration. */
  testID?: string;
}
