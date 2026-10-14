import React, { createContext, useContext, useCallback } from "react";
import { useSharedValue } from "react-native-reanimated";

interface TabBarContextType {
  /** 0 = visible, 1 = caché */
  tabBarHidden: ReturnType<typeof useSharedValue<number>>;
  /** Notifie que le scroll a changé de direction — appelable depuis le thread UI via runOnJS */
  notifyScroll: (hidden: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | null>(null);

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const tabBarHidden = useSharedValue(0);

  // Utiliser useCallback pour que la référence soit stable (important pour runOnJS)
  const notifyScroll = useCallback(
    (hidden: boolean) => {
      "worklet";
      tabBarHidden.value = hidden ? 1 : 0;
    },
    [tabBarHidden]
  );

  return (
    <TabBarContext.Provider value={{ tabBarHidden, notifyScroll }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBarContext() {
  const ctx = useContext(TabBarContext);
  if (!ctx) {
    // Fallback silencieux si utilisé hors provider
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tabBarHidden = useSharedValue(0);
    const notifyScroll = useCallback((_: boolean) => {
      "worklet";
    }, []);
    return { tabBarHidden, notifyScroll };
  }
  return ctx;
}

export const useTabBar = useTabBarContext;
