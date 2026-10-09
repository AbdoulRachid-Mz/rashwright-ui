import { join, dirname } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { copyComponentFiles } from "./file-manager.js";
import { generateUiIndex } from "./starter-generator.js";

export type TemplateType =
  | "minimal"
  | "showcase"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "commerce"
  | "settings";

export interface TemplateMetadata {
  id: TemplateType;
  name: string;
  description: string;
  requiredComponents: string[];
  screenFile: string;
  screenComponentName: string;
}

export const AVAILABLE_TEMPLATES: Record<TemplateType, TemplateMetadata> = {
  minimal: {
    id: "minimal",
    name: "Minimal Starter",
    description: "Écran minimaliste épuré avec branding, card d'accueil et boutons d'action",
    requiredComponents: ["button", "card", "badge", "rashwright-logo"],
    screenFile: "components/ui/minimal-screen.tsx",
    screenComponentName: "RashwrightMinimalScreen",
  },
  showcase: {
    id: "showcase",
    name: "Showcase Complet",
    description: "Démonstration interactive complète avec presets de thèmes, glass UI et upload media",
    requiredComponents: [
      "button",
      "card",
      "glass-card",
      "badge",
      "text-input",
      "upload-image",
      "upload-video",
      "rashwright-logo",
      "showcase-screen",
    ],
    screenFile: "components/ui/showcase-screen.tsx",
    screenComponentName: "RashwrightShowcaseScreen",
  },
  auth: {
    id: "auth",
    name: "Authentication Suite",
    description: "Écrans d'authentification modernes avec connexion, inscription, saisie OTP et validation",
    requiredComponents: [
      "button",
      "card",
      "text-input",
      "divider",
      "badge",
      "checkbox",
      "otp-input",
      "rashwright-logo",
    ],
    screenFile: "components/ui/auth-screen.tsx",
    screenComponentName: "RashwrightAuthScreen",
  },
  onboarding: {
    id: "onboarding",
    name: "Onboarding Flow",
    description: "Parcours d'accueil et d'introduction avec étapes visuelles, carrousel et call-to-actions",
    requiredComponents: ["button", "card", "badge", "carousel", "rashwright-logo"],
    screenFile: "components/ui/onboarding-screen.tsx",
    screenComponentName: "RashwrightOnboardingScreen",
  },
  dashboard: {
    id: "dashboard",
    name: "Analytics & Dashboard",
    description: "Tableau de bord de métriques clés avec StatCards, profil avatar, statut et tableau de données",
    requiredComponents: [
      "button",
      "card",
      "stat-card",
      "badge",
      "avatar",
      "data-table",
      "rashwright-logo",
    ],
    screenFile: "components/ui/dashboard-screen.tsx",
    screenComponentName: "RashwrightDashboardScreen",
  },
  commerce: {
    id: "commerce",
    name: "E-Commerce & Store",
    description: "Boutique en ligne avec barre de recherche, filtres par catégorie, cartes produits et avis",
    requiredComponents: [
      "button",
      "card",
      "badge",
      "rating",
      "search-input",
      "rashwright-logo",
    ],
    screenFile: "components/ui/commerce-screen.tsx",
    screenComponentName: "RashwrightCommerceScreen",
  },
  settings: {
    id: "settings",
    name: "User Settings & Preferences",
    description: "Écran de réglages avec profil, toggles d'apparence/notifications et actions de sécurité",
    requiredComponents: [
      "button",
      "card",
      "switch",
      "avatar",
      "badge",
      "divider",
      "rashwright-logo",
    ],
    screenFile: "components/ui/settings-screen.tsx",
    screenComponentName: "RashwrightSettingsScreen",
  },
};

export function listTemplates(): TemplateMetadata[] {
  return Object.values(AVAILABLE_TEMPLATES);
}

export function getTemplate(type: string): TemplateMetadata | null {
  const normalized = type.toLowerCase() as TemplateType;
  return AVAILABLE_TEMPLATES[normalized] || null;
}

export function getTemplateComponents(type: TemplateType): string[] {
  const t = AVAILABLE_TEMPLATES[type];
  return t ? [...t.requiredComponents] : [];
}

/**
 * Génère le code TSX de l'écran pour un template donné.
 */
export function generateTemplateScreenCode(type: TemplateType): string {
  switch (type) {
    case "minimal":
      return `import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "./rashwright-logo";
import Button from "./button";
import Card from "./card";
import Badge from "./badge";

export function RashwrightMinimalScreen() {
  const { theme, isDark, mode, setMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <RashwrightLogo size={80} showText={true} isDark={isDark} primaryColor={theme.colors.primary} />
          <View style={styles.badgeRow}>
            <Badge variant="outline">Minimal Starter</Badge>
            <Badge variant="default">Expo SDK</Badge>
            <Badge variant="success">Prêt</Badge>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Bienvenue dans votre application
          </Text>
          <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
            Ce starter minimaliste fournit la structure essentielle configurée avec les composants universels Rashwright UI.
          </Text>

          <View style={styles.actions}>
            <Button
              variant="default"
              onPress={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              Basculer Thème ({mode})
            </Button>
            <Button
              variant="outline"
              onPress={() => console.log("Documentation")}
            >
              Documentation
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, alignItems: "center", justifyContent: "center", minHeight: "100%" },
  hero: { alignItems: "center", marginBottom: 32, gap: 16 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  card: { width: "100%", padding: 24, borderRadius: 20, gap: 16 },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  description: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  actions: { gap: 12, marginTop: 8 },
});

export default RashwrightMinimalScreen;
`;

    case "auth":
      return `import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "./rashwright-logo";
import Button from "./button";
import Card from "./card";
import TextInput from "./text-input";
import Divider from "./divider";
import Badge from "./badge";
import Checkbox from "./checkbox";
import OtpInput from "./otp-input";

export function RashwrightAuthScreen() {
  const { theme, isDark } = useTheme();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState("");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RashwrightLogo size={70} showText={false} isDark={isDark} primaryColor={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            {tab === "login" ? "Connexion" : "Créer un compte"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
            {tab === "login"
              ? "Accédez à votre espace sécurisé Rashwright"
              : "Rejoignez la communauté en quelques secondes"}
          </Text>
        </View>

        {/* Tab switch */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.muted }]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "login" && { backgroundColor: theme.colors.card }]}
            onPress={() => setTab("login")}
          >
            <Text style={[styles.tabText, { color: tab === "login" ? theme.colors.foreground : theme.colors.mutedForeground }]}>
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "signup" && { backgroundColor: theme.colors.card }]}
            onPress={() => setTab("signup")}
          >
            <Text style={[styles.tabText, { color: tab === "signup" ? theme.colors.foreground : theme.colors.mutedForeground }]}>
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.card}>
          <TextInput
            label="Adresse Email"
            placeholder="nom@exemple.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.rememberRow}>
            <Checkbox
              checked={rememberMe}
              onValueChange={setRememberMe}
              label="Se souvenir de moi"
            />
          </View>

          <Button variant="default" isFullWidth onPress={() => console.log("Submit Auth", { tab, email })}>
            {tab === "login" ? "Se connecter" : "Créer mon compte"}
          </Button>

          <Divider label="OU AVEC CODE OTP" />

          <View style={styles.otpSection}>
            <View style={styles.otpHeader}>
              <Text style={[styles.otpTitle, { color: theme.colors.foreground }]}>Code à usage unique</Text>
              <Badge variant="outline">Sécurisé</Badge>
            </View>
            <OtpInput
              length={4}
              value={otp}
              onChange={setOtp}
              onComplete={(code) => console.log("OTP Complete:", code)}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, gap: 20 },
  header: { alignItems: "center", gap: 8, marginTop: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, textAlign: "center" },
  tabBar: { flexDirection: "row", borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  card: { padding: 20, borderRadius: 20, gap: 16 },
  rememberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  otpSection: { gap: 12, alignItems: "center" },
  otpHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  otpTitle: { fontSize: 13, fontWeight: "600" },
});

export default RashwrightAuthScreen;
`;

    case "onboarding":
      return `import React, { useState } from "react";
import { StyleSheet, View, Text, StatusBar, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "./rashwright-logo";
import Button from "./button";
import Card from "./card";
import Badge from "./badge";
import { Carousel } from "./carousel";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  badge: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    badge: "Universel",
    title: "Design Universel & Pur",
    description: "Composants React Native haut de gamme pensés pour iOS et Android avec ergonomie exemplaire.",
  },
  {
    id: "2",
    badge: "Innovant",
    title: "Moteur Liquid Glass",
    description: "Flous translucides, bordures adaptatives et dynamique de verre dépoli natif.",
  },
  {
    id: "3",
    badge: "Rapide",
    title: "Prêt pour la Production",
    description: "Zero any, typage strict, architecture modulaire et CLI de commande intelligente.",
  },
];

export function RashwrightOnboardingScreen() {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <RashwrightLogo size={50} showText={false} isDark={isDark} primaryColor={theme.colors.primary} />
          <Badge variant="outline">Étape {currentIndex + 1} / {SLIDES.length}</Badge>
        </View>

        <View style={styles.carouselContainer}>
          <Carousel
            data={SLIDES}
            itemWidth={width - 48}
            spacing={16}
            showIndicators={true}
            renderItem={(slide, index) => (
              <Card key={slide.id} style={styles.slideCard}>
                <View style={styles.slideContent}>
                  <Badge variant="default" style={styles.slideBadge}>{slide.badge}</Badge>
                  <Text style={[styles.slideTitle, { color: theme.colors.foreground }]}>
                    {slide.title}
                  </Text>
                  <Text style={[styles.slideDesc, { color: theme.colors.mutedForeground }]}>
                    {slide.description}
                  </Text>
                </View>
              </Card>
            )}
          />
        </View>

        <View style={styles.footer}>
          <Button
            variant="ghost"
            style={styles.skipBtn}
            onPress={() => console.log("Skip Onboarding")}
          >
            Passer
          </Button>
          <Button
            variant="default"
            style={styles.nextBtn}
            onPress={() => {
              if (currentIndex < SLIDES.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                console.log("Finish Onboarding");
              }
            }}
          >
            {currentIndex === SLIDES.length - 1 ? "Commencer" : "Suivant"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: "space-between" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  carouselContainer: { flex: 1, justifyContent: "center" },
  slideCard: { padding: 32, borderRadius: 24, minHeight: 280, justifyContent: "center" },
  slideContent: { gap: 16, alignItems: "center" },
  slideBadge: { alignSelf: "center" },
  slideTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  slideDesc: { fontSize: 15, lineHeight: 24, textAlign: "center" },
  footer: { flexDirection: "row", gap: 12, alignItems: "center" },
  skipBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

export default RashwrightOnboardingScreen;
`;

    case "dashboard":
      return `import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "./rashwright-logo";
import Button from "./button";
import Card from "./card";
import StatCard from "./stat-card";
import Badge from "./badge";
import Avatar from "./avatar";
import { DataTable } from "./data-table";

interface ProjectRow extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  budget: string;
}

const TABLE_DATA: ProjectRow[] = [
  { id: "1", name: "Application Mobile", status: "En cours", budget: "4 800 €" },
  { id: "2", name: "Refonte Rashwright UI", status: "Terminé", budget: "8 200 €" },
  { id: "3", name: "Design System", status: "Actif", budget: "3 150 €" },
];

export function RashwrightDashboardScreen() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header avec Profil */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar name="Alexandre Martin" verified size="md" />
            <View>
              <Text style={[styles.greeting, { color: theme.colors.foreground }]}>Bonjour, Alexandre 👋</Text>
              <Text style={[styles.subGreeting, { color: theme.colors.mutedForeground }]}>Tableau de bord projet</Text>
            </View>
          </View>
          <Badge variant="default">Pro</Badge>
        </View>

        {/* Métriques / StatCards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Utilisateurs"
            value="14.2k"
            change="+12.4%"
            trend="up"
            style={styles.statItem}
          />
          <StatCard
            label="Revenu Récurrent"
            value="38 900 €"
            change="+8.1%"
            trend="up"
            style={styles.statItem}
          />
        </View>

        {/* Projets récents / DataTable */}
        <Card style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableTitle, { color: theme.colors.foreground }]}>Projets Actifs</Text>
            <Button size="sm" variant="outline" onPress={() => console.log("Nouveau projet")}>
              + Nouveau
            </Button>
          </View>

          <DataTable<ProjectRow>
            data={TABLE_DATA}
            columns={[
              { key: "name", header: "Nom du Projet", flex: 2 },
              { key: "status", header: "Statut", flex: 1 },
              { key: "budget", header: "Budget", flex: 1 },
            ]}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, gap: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", gap: 12, alignItems: "center" },
  greeting: { fontSize: 17, fontWeight: "700" },
  subGreeting: { fontSize: 13 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statItem: { flex: 1 },
  tableCard: { padding: 18, borderRadius: 20, gap: 12 },
  tableHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tableTitle: { fontSize: 16, fontWeight: "700" },
});

export default RashwrightDashboardScreen;
`;

    case "commerce":
      return `import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import Button from "./button";
import Card from "./card";
import Badge from "./badge";
import { Rating } from "./rating";
import SearchInput from "./search-input";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  inStock: boolean;
}

const PRODUCTS: Product[] = [
  { id: "1", name: "Casque Audio Pro ANC", category: "Audio", price: "249 €", rating: 4.8, inStock: true },
  { id: "2", name: "Montre Connectée Sport", category: "Wearables", price: "189 €", rating: 4.5, inStock: true },
  { id: "3", name: "Clavier Mécanique Sans Fil", category: "Accessoires", price: "129 €", rating: 4.2, inStock: false },
];

export function RashwrightCommerceScreen() {
  const { theme, isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tous");
  const [cartCount, setCartCount] = useState(2);

  const categories = ["Tous", "Audio", "Wearables", "Accessoires"];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>Boutique RS</Text>
            <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>Produits sélectionnés pour vous</Text>
          </View>
          <Badge variant="default">{cartCount} au panier</Badge>
        </View>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un produit..."
        />

        {/* Filtres de catégories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
          {categories.map((c) => (
            <TouchableOpacity key={c} onPress={() => setSelectedCat(c)}>
              <Badge variant={selectedCat === c ? "default" : "outline"}>{c}</Badge>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste des produits */}
        <View style={styles.productsList}>
          {PRODUCTS.filter(p => selectedCat === "Tous" || p.category === selectedCat).map((prod) => (
            <Card key={prod.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={[styles.productName, { color: theme.colors.foreground }]}>{prod.name}</Text>
                  <Badge variant={prod.inStock ? "success" : "destructive"}>
                    {prod.inStock ? "En stock" : "Rupture"}
                  </Badge>
                </View>

                <View style={styles.ratingRow}>
                  <Rating value={prod.rating} readonly size="sm" />
                  <Text style={[styles.ratingText, { color: theme.colors.mutedForeground }]}>{prod.rating}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: theme.colors.primary }]}>{prod.price}</Text>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={!prod.inStock}
                    onPress={() => setCartCount(c => c + 1)}
                  >
                    Ajouter
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  catsRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  productsList: { gap: 14 },
  productCard: { padding: 16, borderRadius: 18 },
  productInfo: { gap: 10 },
  productHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 16, fontWeight: "600", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { fontSize: 18, fontWeight: "700" },
});

export default RashwrightCommerceScreen;
`;

    case "settings":
      return `import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import Button from "./button";
import Card from "./card";
import Switch from "./switch";
import Avatar from "./avatar";
import Badge from "./badge";
import Divider from "./divider";

export function RashwrightSettingsScreen() {
  const { theme, isDark, mode, setMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>Paramètres</Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>Gérez vos préférences et options de compte</Text>
        </View>

        {/* Profil */}
        <Card style={styles.profileCard}>
          <Avatar name="Alexandre Martin" verified size="lg" />
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: theme.colors.foreground }]}>Alexandre Martin</Text>
            <Text style={[styles.profileEmail, { color: theme.colors.mutedForeground }]}>alexandre@rashwright.dev</Text>
            <Badge variant="default" style={styles.profileBadge}>Membre Pro</Badge>
          </View>
        </Card>

        {/* Préférences d'apparence */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Apparence & Système</Text>
          
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.foreground }]}>Mode Sombre</Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setMode(val ? "dark" : "light")}
            />
          </View>

          <Divider />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.foreground }]}>Notifications Push</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>

          <Divider />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.foreground }]}>Retour Haptique</Text>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
            />
          </View>
        </Card>

        {/* Déconnexion */}
        <Button variant="destructive" isFullWidth onPress={() => console.log("Déconnexion")}>
          Se déconnecter
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, gap: 16 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  profileCard: { flexDirection: "row", padding: 18, borderRadius: 20, alignItems: "center", gap: 16 },
  profileDetails: { gap: 4, flex: 1 },
  profileName: { fontSize: 17, fontWeight: "700" },
  profileEmail: { fontSize: 13 },
  profileBadge: { alignSelf: "flex-start", marginTop: 4 },
  sectionCard: { padding: 18, borderRadius: 20, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 15, fontWeight: "500" },
});

export default RashwrightSettingsScreen;
`;

    case "showcase":
    default:
      return ""; // showcase-screen.tsx est déjà présent dans packages/ui-mobile/components/ui/
  }
}

/**
 * Configure et installe un template starter dans le projet cible.
 */
export function setupStarterTemplate(
  sourceRoot: string,
  targetProjectRoot: string,
  templateType: TemplateType = "showcase",
  options: {
    componentsPath?: string;
    themePreset?: string;
    dryRun?: boolean;
  } = {}
): {
  installedComponents: string[];
  entryScreenRelPath: string;
} {
  const { componentsPath = "src/components/ui", themePreset = "default", dryRun = false } = options;
  const meta = AVAILABLE_TEMPLATES[templateType] || AVAILABLE_TEMPLATES.showcase;

  const targetComponentsDir = join(targetProjectRoot, componentsPath);
  if (!existsSync(targetComponentsDir) && !dryRun) {
    mkdirSync(targetComponentsDir, { recursive: true });
  }

  // 1. Déterminer les fichiers composants à copier depuis sourceRoot
  const componentFilesToCopy: string[] = [];
  for (const compName of meta.requiredComponents) {
    if (compName === "showcase-screen") {
      componentFilesToCopy.push("components/ui/showcase-screen.tsx");
    } else {
      componentFilesToCopy.push(`components/ui/${compName}.tsx`);
    }
  }

  // Copie des composants
  copyComponentFiles(componentFilesToCopy, sourceRoot, targetComponentsDir, {
    overwrite: true,
    dryRun,
  });

  // 2. Si le template a son propre écran généré (autre que showcase-screen.tsx natif)
  const screenFileName = meta.screenFile.replace(/^components\/ui\//, "");
  if (templateType !== "showcase" && !dryRun) {
    const code = generateTemplateScreenCode(templateType);
    if (code) {
      writeFileSync(join(targetComponentsDir, screenFileName), code, "utf-8");
    }
  }

  const installedComps = [...meta.requiredComponents];
  if (templateType !== "showcase") {
    installedComps.push(screenFileName.replace(/\.tsx$/, ""));
  }

  // 3. Mise à jour de components/ui/index.ts
  generateUiIndex(targetComponentsDir, installedComps, dryRun);

  return {
    installedComponents: installedComps,
    entryScreenRelPath: screenFileName.replace(/\.tsx$/, ""),
  };
}
