// @/components/widgets/finance/types.ts

import type { StyleProp, ViewStyle } from "react-native";

export interface FinanceActionShortcut {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

export interface FinanceWidgetProps {
  /** Titre ou libellé du solde (ex: "Solde total", "Portefeuille principal"). */
  title?: string;
  /** Solde principal actuel (ex: 2450.80 ou "2 450,80 €"). */
  balance: number | string;
  /** Devise associée au solde (ex: "€", "$", "FCFA", "XOF"). */
  currency?: string;
  /** Montant total des revenus sur la période (ex: "+ 3 200,00 €"). */
  income?: string | number;
  /** Montant total des dépenses sur la période (ex: "- 749,20 €"). */
  expense?: string | number;
  /** Période analysée (ex: "Ce mois", "Octobre 2026"). */
  periodLabel?: string;
  /** Active ou désactive le bouton œil pour masquer le solde (défaut: true). */
  allowPrivacyMasking?: boolean;
  /** État initial de masquage du solde (défaut: false). */
  defaultMasked?: boolean;
  /** Raccourcis d'actions rapides (ex: Envoyer, Recharger, Historique). */
  shortcuts?: FinanceActionShortcut[];
  /** État de chargement avec affichage de squelettes. */
  loading?: boolean;
  /** Variante visuelle de la carte conteneur. */
  variant?: "default" | "bordered" | "glass";
  /** Style personnalisé pour le conteneur racine. */
  style?: StyleProp<ViewStyle>;
  /** Identifiant optionnel pour les tests d'intégration. */
  testID?: string;
}
