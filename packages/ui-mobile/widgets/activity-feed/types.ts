// @/components/widgets/activity-feed/types.ts

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type ActivityStatus = "completed" | "pending" | "failed" | "info";
export type ActivityAmountType = "positive" | "negative" | "neutral";

export interface ActivityFeedItem {
  /** Identifiant unique de l'activité. */
  id: string;
  /** Titre ou libellé principal (ex: "Virement reçu", "Commande #1042", "Connexion"). */
  title: string;
  /** Description ou nom de l'émetteur/destinataire. */
  description?: string;
  /** Horodatage ou libellé temporel (ex: "Il y a 5 min", "Aujourd'hui, 14:32"). */
  timestamp: string;
  /** Nom d'icône Ionicons (ex: "arrow-down", "cart", "checkmark"). */
  icon?: string;
  /** URL d'un avatar image. */
  avatarUrl?: string;
  /** Initiales ou nom court pour l'avatar texte. */
  avatarInitials?: string;
  /** Statut visuel de l'activité. */
  status?: ActivityStatus;
  /** Libellé optionnel du badge de statut. */
  statusLabel?: string;
  /** Montant ou valeur financière optionnelle (ex: "+ 120,00 €", "- 45,90 €"). */
  amount?: string;
  /** Type de montant pour la couleur (positif vert, négatif rouge, neutre standard). */
  amountType?: ActivityAmountType;
  /** Callback optionnel lors du clic sur l'élément. */
  onPress?: () => void;
}

export interface ActivityFeedWidgetProps {
  /** Titre du widget (ex: "Activité récente", "Dernières transactions"). */
  title: string;
  /** Sous-titre ou description. */
  subtitle?: string;
  /** Liste des activités ordonnées chronologiquement. */
  items: ActivityFeedItem[];
  /** Nombre maximum d'éléments affichés (défaut: 5). */
  maxItems?: number;
  /** Affiche des séparateurs entre chaque ligne (défaut: true). */
  showDividers?: boolean;
  /** Callback optionnel pour le lien "Voir tout". */
  onViewAll?: () => void;
  /** Libellé du lien d'action (défaut: "Voir tout"). */
  viewAllLabel?: string;
  /** Texte affiché si aucune activité n'est disponible. */
  emptyText?: string;
  /** État de chargement avec squelettes de contenu. */
  loading?: boolean;
  /** Variante visuelle de la carte conteneur. */
  variant?: "default" | "bordered" | "glass";
  /** Style personnalisé pour le conteneur racine. */
  style?: StyleProp<ViewStyle>;
  /** Identifiant optionnel pour les tests d'intégration. */
  testID?: string;
}
