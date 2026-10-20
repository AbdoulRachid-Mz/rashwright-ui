# Phase 7 — Écrans & Widgets Expo Critiques

> Spécifications, dépendances et étapes de mise en œuvre
> Rashwright UI Mobile v1.5.0

---

## Contexte

Le système Rashwright UI fournit 70 composants UI de base et 10 templates autonomes. La Phase 7 vise à intégrer les **écrans natifs et widgets Expo** les plus critiques pour un projet mobile production-ready, en complément des composants existants.

---

## Écrans critiques à intégrer

### 1. SplashScreen géré (`ManagedSplashScreen`)

**Description** : Gestion de l'écran de démarrage avec contrôle manuel du moment où il disparaît (après chargement des données, fonts, etc.).

**Dépendances** :
- `expo-splash-screen` (via `expo install`)
- `expo-font` (chargement des polices Inter)

**Implémentation** :
```tsx
// src/app/_layout.tsx — pattern recommandé
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return <ThemeProvider>...</ThemeProvider>;
}
```

**CLI Action** : `rs-ui init` devra automatiquement :
1. Créer `src/assets/fonts/` avec les 4 polices Inter téléchargées
2. Configurer le `_layout.tsx` avec `SplashScreen.preventAutoHideAsync()`
3. Ajouter `expo-splash-screen` et `expo-font` aux deps Expo

---

### 2. Gestion des permissions (`PermissionGate`)

**Description** : Composant wrapper qui demande les permissions nécessaires (caméra, galerie, notifications, localisation) avant d'afficher du contenu.

**Dépendances** :
- `expo-camera` (optionnel)
- `expo-notifications`
- `expo-location` (optionnel)
- `expo-image-picker` (déjà installé)

**Spécification du composant** :
```tsx
// src/components/ui/permission-gate.tsx
interface PermissionGateProps {
  permissions: ('camera' | 'gallery' | 'notifications' | 'location')[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

**Comportement** :
- Demande les permissions au montage
- Affiche `fallback` si refusé avec option de rouvrir les Settings
- Mémoïse l'état des permissions

---

### 3. Notifications Push (`NotificationManager`)

**Description** : Hook et utilitaire pour gérer l'enregistrement aux notifications push Expo et la navigation sur tap.

**Dépendances** :
- `expo-notifications`
- `expo-device`
- `expo-constants`

**API** :
```tsx
// src/hooks/use-push-notifications.ts
export function usePushNotifications() {
  return {
    expoPushToken: string | null,
    notification: Notifications.Notification | null,
    scheduleLocalNotification: (content, trigger) => Promise<void>,
    registerForPushNotifications: () => Promise<string | null>,
  };
}
```

---

### 4. Deep Linking & Navigation universelle

**Description** : Configuration du deep linking pour Expo Router avec URL scheme personnalisé et Universal Links.

**Dépendances** :
- `expo-linking` (déjà installé)
- `expo-router` (déjà installé)

**Configuration** dans `app.json` :
```json
{
  "expo": {
    "scheme": "monapp",
    "web": { "bundler": "metro" },
    "ios": { "bundleIdentifier": "com.monapp" },
    "android": { "package": "com.monapp" }
  }
}
```

**Écran de handler** :
```tsx
// src/app/[...deep-link].tsx — catch-all pour deep links non reconnus
export default function UnknownDeepLink() {
  const { segments } = useLocalSearchParams();
  return <Redirect href="/" />;
}
```

---

### 5. Biométrie / Authentification locale (`BiometricAuth`)

**Description** : Authentification par empreinte digitale ou Face ID pour sécuriser l'accès.

**Dépendances** :
- `expo-local-authentication`

**Spécification** :
```tsx
// src/hooks/use-biometric-auth.ts
export function useBiometricAuth() {
  return {
    isSupported: boolean,
    biometricType: 'fingerprint' | 'facial' | 'iris' | null,
    authenticate: (prompt?: string) => Promise<boolean>,
    isEnrolled: boolean,
  };
}
```

---

### 6. Background Tasks & App State (`AppStateManager`)

**Description** : Gestion des tâches de fond et de l'état de l'application (active/background/inactive).

**Dépendances** :
- `expo-background-fetch`
- `expo-task-manager`
- `AppState` (React Native natif)

**Spécification** :
```tsx
// src/hooks/use-app-state.ts
export function useAppState() {
  return {
    currentState: 'active' | 'background' | 'inactive',
    isActive: boolean,
    wasInBackground: boolean,
    lastActiveTimestamp: Date | null,
  };
}
```

---

### 7. Téléchargement de fichiers (`FileDownloader`)

**Description** : Composant et hook pour télécharger et sauvegarder des fichiers avec barre de progression.

**Dépendances** :
- `expo-file-system`
- `expo-media-library`
- `expo-sharing`

**Spécification** :
```tsx
interface FileDownloaderProps {
  uri: string;
  filename: string;
  onComplete?: (localUri: string) => void;
  onError?: (error: Error) => void;
  autoSave?: boolean; // Sauvegarde dans la galerie/documents
}

export function useFileDownload(uri: string) {
  return {
    download: () => Promise<string>,
    progress: number, // 0-1
    status: 'idle' | 'downloading' | 'done' | 'error',
    localUri: string | null,
  };
}
```

---

### 8. Scan QR / Codes-barres (`QRScanner`)

**Description** : Écran de scan de QR codes et codes-barres avec feedback haptique.

**Dépendances** :
- `expo-camera`
- `expo-barcode-scanner` (via expo-camera depuis SDK 54+)
- `expo-haptics` (déjà installé)

**Composant** :
```tsx
interface QRScannerProps {
  onScan: (data: string, type: string) => void;
  onClose: () => void;
  formats?: BarcodeType[];
}
```

---

### 9. Carte Interactive (`MapView`)

**Description** : Wrapper pour react-native-maps avec marqueurs, clusters et thème automatique.

**Dépendances** :
- `react-native-maps` (via `expo install`)

**Note** : Requiert un rebuild natif (`npx expo run:ios` / `npx expo run:android`).

**Spécification** :
```tsx
interface RashwrightMapProps {
  initialRegion?: Region;
  markers?: MapMarker[];
  onMarkerPress?: (marker: MapMarker) => void;
  style?: StyleProp<ViewStyle>;
  showsUserLocation?: boolean;
  variant?: 'standard' | 'satellite' | 'hybrid';
}
```

---

### 10. Sélecteur de fichiers multi-format (`DocumentPicker`)

**Description** : Sélection de documents (PDF, Word, Excel, images) avec preview.

**Dépendances** :
- `expo-document-picker`

**Composant** :
```tsx
interface DocumentPickerProps {
  type?: 'image' | 'video' | 'audio' | 'pdf' | 'any';
  multiple?: boolean;
  onSelect: (files: DocumentPickerAsset[]) => void;
  maxSize?: number; // en bytes
  children: React.ReactNode; // trigger button
}
```

---

## Plan de mise en œuvre

### Priorité 1 — Intégration immédiate (v1.5.0)
- ✅ `SplashScreen` + `expo-font` : ajout dans `rs-ui init`
- ✅ `AppState` hook : `use-app-state.ts`
- ✅ `usePushNotifications` hook : intégration dans skills

### Priorité 2 — Composants à créer (v1.6.0)
- `PermissionGate` composant
- `useFileDownload` hook + composant
- `useBiometricAuth` hook
- `DocumentPicker` composant

### Priorité 3 — Natif rebuild requis (v2.0.0)
- `QRScanner` (expo-camera)
- `MapView` (react-native-maps)

---

## Dépendances à ajouter au CORE_EXPO_DEPS

```typescript
// packages/cli/src/commands/init.ts
const CORE_EXPO_DEPS = [
  // ... dépendances existantes ...
  "expo-splash-screen",   // SplashScreen géré
  "expo-font",            // Polices Inter
  "expo-notifications",   // Notifications push
  "expo-file-system",     // Opérations fichiers
  "expo-sharing",         // Partage de fichiers
];
```

---

## Tests requis

| Composant | Test unitaire | Test E2E (Maestro) |
|-----------|--------------|---------------------|
| `usePushNotifications` | Mock Notifications API | — |
| `useAppState` | Mock AppState events | `app-launch.yaml` |
| `PermissionGate` | Mock permissions API | — |
| `useFileDownload` | Mock FileSystem API | — |
| `useBiometricAuth` | Mock LocalAuthentication | — |

---

*Phase 7 — Spécifications Rashwright UI v1.5.0 · Octobre 2026*
