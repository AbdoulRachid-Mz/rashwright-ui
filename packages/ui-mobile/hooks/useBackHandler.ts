// @/hooks/useBackHandler.ts
import { useEffect, useRef } from "react";
import { BackHandler, Alert, Platform, ToastAndroid } from "react-native";
import { useRouter } from "expo-router";

interface UseBackHandlerOptions {
  /** Mode de sortie : 'alert' (boîte de dialogue de confirmation) ou 'toast' (double appui avec toast) */
  mode?: "alert" | "toast" | "both";
  /** Si true, actif uniquement si le routeur ne peut pas revenir en arrière */
  onlyAtRoot?: boolean;
}

/**
 * Hook pour gérer le retour en arrière Android et demander confirmation avant de quitter.
 */
export function useBackHandler(options: UseBackHandlerOptions = {}) {
  const { mode = "alert", onlyAtRoot = false } = options;
  const router = useRouter();
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const onBackPress = () => {
      // Si onlyAtRoot est activé et qu'on peut revenir en arrière dans l'historique, laisser faire le routeur
      if (onlyAtRoot && router.canGoBack()) {
        router.back();
        return true;
      }

      if (mode === "alert") {
        Alert.alert(
          "Quitter l'application",
          "Voulez-vous vraiment quitter Immo360 ?",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Quitter",
              style: "destructive",
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: true }
        );
        return true;
      }

      if (mode === "toast") {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressTime.current = now;
        ToastAndroid.show("Appuyez à nouveau pour quitter", ToastAndroid.SHORT);
        return true;
      }

      // Mode "both" : double appui rapide OU alerte
      const now = Date.now();
      if (now - lastBackPressTime.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressTime.current = now;
      Alert.alert(
        "Quitter l'application",
        "Voulez-vous vraiment quitter Immo360 ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Quitter",
            style: "destructive",
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true }
      );
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [mode, onlyAtRoot, router]);
}

export default useBackHandler;