/**
 * generate-screen.ts
 *
 * Générateur d'écrans complets conformes aux tokens de thème et bonnes pratiques mobiles Rashwright.
 */

export interface GenerateScreenParams {
  title?: string;
  screenType?: "dashboard" | "list" | "form" | "profile" | "settings" | "detail" | "empty";
  components?: string[];
  styleMode?: "styleSheet" | "nativewind";
  useGlass?: boolean;
}

export function generateScreenCode(params: GenerateScreenParams): string {
  const title = params.title || "Mon Écran";
  const type = params.screenType || "dashboard";
  const requestedComponents = params.components || ["card", "button", "badge", "text-input"];
  const styleMode = params.styleMode || "styleSheet";
  const useGlass = params.useGlass !== false;

  const componentImports = new Set<string>();
  for (const c of requestedComponents) {
    const norm = c.trim().toLowerCase();
    if (norm) {
      componentImports.add(norm);
    }
  }

  // Nom pascal case
  const screenComponentName = title
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase()) + "Screen";

  // Imports
  const importLines: string[] = [
    `import React, { useState } from "react";`,
    `import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";`,
    `import { useTheme } from "@/contexts/theme-context";`,
  ];

  for (const comp of componentImports) {
    const compPascal = comp
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
    importLines.push(`import ${compPascal} from "@/components/ui/${comp}";`);
  }

  // Body content based on type
  let bodyContent = "";
  if (type === "dashboard") {
    bodyContent = `
      {/* KPI Cards */}
      <View style={styles.grid}>
        <Card variant="${useGlass ? "glass" : "default"}" style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.mutedForeground }]}>Activité</Text>
          <Text style={[styles.cardNumber, { color: theme.colors.foreground }]}>+28.4%</Text>
          <Badge variant="default" style={styles.badge}>En hausse</Badge>
        </Card>
        <Card variant="${useGlass ? "glass" : "default"}" style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.mutedForeground }]}>Statut</Text>
          <Text style={[styles.cardNumber, { color: theme.colors.primary }]}>Actif</Text>
          <Badge variant="secondary" style={styles.badge}>Vérifié</Badge>
        </Card>
      </View>

      {/* Action Button */}
      <Button
        variant="default"
        size="lg"
        onPress={() => console.log("Action Dashboard")}
        accessibilityLabel="Action principale"
        style={styles.actionBtn}
      >
        Explorer les rapports
      </Button>
    `;
  } else if (type === "form") {
    bodyContent = `
      <Card variant="${useGlass ? "glass" : "default"}" style={styles.formCard}>
        <Text style={[styles.label, { color: theme.colors.foreground }]}>Nom complet</Text>
        <TextInput
          placeholder="Entrez votre nom..."
          value={inputVal}
          onChangeText={setInputVal}
          style={styles.input}
        />
        <Button
          variant="default"
          size="md"
          onPress={() => console.log("Submit", inputVal)}
          accessibilityLabel="Valider le formulaire"
          style={styles.actionBtn}
        >
          Enregistrer
        </Button>
      </Card>
    `;
  } else {
    bodyContent = `
      <Card variant="${useGlass ? "glass" : "default"}" style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.foreground }]}>Bienvenue sur ${title}</Text>
        <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
          Écran généré avec succès par l'outil MCP Rashwright UI.
        </Text>
        <Button
          variant="default"
          onPress={() => console.log("Click")}
          accessibilityLabel="Action"
          style={styles.actionBtn}
        >
          Continuer
        </Button>
      </Card>
    `;
  }

  const code = `// @/screens/${screenComponentName}.tsx
${importLines.join("\n")}

export interface ${screenComponentName}Props {
  onNavigateBack?: () => void;
}

export function ${screenComponentName}({ onNavigateBack }: ${screenComponentName}Props) {
  const { theme } = useTheme();
  const [inputVal, setInputVal] = useState("");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>
            ${title}
          </Text>
        </View>

        ${bodyContent.trim()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  formCard: {
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 14,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },
  badge: {
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    marginVertical: 4,
  },
  actionBtn: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ${screenComponentName};
`;

  return code;
}
