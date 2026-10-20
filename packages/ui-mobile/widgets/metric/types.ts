// @/components/widgets/metric/types.ts

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricWidgetProps {
  /** Titre ou libellé de l'indicateur (ex: "Chiffre d'affaires", "Utilisateurs actifs"). */
  title: string;
  /** Valeur principale affichée (numérique ou chaîne déjà formatée). */
  value: string | number;
  /** Description ou contexte temporel (ex: "vs mois dernier", "Objectif annuel"). */
  description?: string;
  /** Valeur de variation ou delta (ex: "+12.4%", "-350 €"). */
  change?: string;
  /** Direction de la tendance pour la couleur et l'icône de l'indicateur. */
  trend?: MetricTrend;
  /** Libellé d'accessibilité additionnel pour la tendance. */
  trendLabel?: string;
  /** Icône ou illustration personnalisée à droite du header. */
  icon?: ReactNode;
  /** État de chargement avec affichage de squelettes de contenu (Skeleton). */
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
