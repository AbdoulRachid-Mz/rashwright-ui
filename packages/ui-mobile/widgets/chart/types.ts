// @/components/widgets/chart/types.ts

import type { StyleProp, ViewStyle } from "react-native";

export interface ChartDataPoint {
  /** Libellé de l'axe X (ex: "Lun", "Mar", "Jan", "Q1"). */
  label: string;
  /** Valeur numérique principale. */
  value: number;
  /** Valeur secondaire optionnelle (ex: comparatif N-1 ou dépenses vs revenus). */
  secondaryValue?: number;
  /** Couleur spécifique pour cette barre (écrase la couleur de série). */
  color?: string;
  /** Info-bulle personnalisée ou description. */
  tooltip?: string;
}

export type ChartType = "bar" | "horizontal-bar";

export interface ChartWidgetProps {
  /** Titre du graphique (ex: "Activité hebdomadaire", "Revenus mensuels"). */
  title: string;
  /** Sous-titre ou période (ex: "Semaine en cours", "Derniers 30 jours"). */
  subtitle?: string;
  /** Données du graphique. */
  data: ChartDataPoint[];
  /** Type de présentation (défaut: "bar"). */
  type?: ChartType;
  /** Hauteur de la zone de tracé en pixels (défaut: 160). */
  height?: number;
  /** Unité des valeurs pour l'affichage de l'infobulle (ex: "€", "k", "h"). */
  unit?: string;
  /** Couleur principale des barres (défaut: theme.colors.primary). */
  color?: string;
  /** Couleur secondaire pour secondaryValue (défaut: theme.colors.mutedForeground). */
  secondaryColor?: string;
  /** Texte affiché si aucune donnée n'est disponible. */
  emptyText?: string;
  /** État de chargement avec affichage de squelettes. */
  loading?: boolean;
  /** Variante visuelle de la carte conteneur. */
  variant?: "default" | "bordered" | "glass";
  /** Callback optionnel lors de la sélection d'un point. */
  onSelectPoint?: (point: ChartDataPoint, index: number) => void;
  /** Style personnalisé pour le conteneur racine. */
  style?: StyleProp<ViewStyle>;
  /** Identifiant optionnel pour les tests d'intégration. */
  testID?: string;
}
