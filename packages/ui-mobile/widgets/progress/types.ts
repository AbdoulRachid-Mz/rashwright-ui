// @/components/widgets/progress/types.ts

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export interface ProgressWidgetProps {
  /** Titre de l'objectif ou du projet (ex: "Épargne vacances", "Quotas mensuels"). */
  title: string;
  /** Valeur actuelle atteinte. */
  current: number;
  /** Valeur cible à atteindre (défaut: 100). */
  target?: number;
  /** Unité ou devise associée aux valeurs (ex: "€", "km", "pts"). */
  unit?: string;
  /** Description ou contexte additionnel (ex: "Reste 250 € pour atteindre l'objectif"). */
  description?: string;
  /** Libellé affiché lorsque l'objectif est atteint à 100% (ex: "Objectif atteint !"). */
  completedLabel?: string;
  /** Affiche le badge de pourcentage calculé (défaut: true). */
  showPercentage?: boolean;
  /** Hauteur personnalisée de la barre de progression (défaut: 8). */
  barHeight?: number;
  /** Icône ou illustration optionnelle à droite du header. */
  icon?: ReactNode;
  /** État de chargement avec squelettes de contenu (Skeleton). */
  loading?: boolean;
  /** Variante visuelle de la carte conteneur. */
  variant?: "default" | "bordered" | "glass";
  /** Callback optionnel déclenché lors de la pression sur le widget. */
  onPress?: () => void;
  /** Style personnalisé pour le conteneur racine. */
  style?: StyleProp<ViewStyle>;
  /** Identifiant optionnel pour les tests d'intégration. */
  testID?: string;
}
