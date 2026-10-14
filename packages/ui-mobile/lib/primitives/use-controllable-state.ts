// @/lib/primitives/use-controllable-state.ts
import { useState, useCallback, useRef, useEffect } from "react";

export interface UseControllableStateParams<T> {
  /** Valeur contrôlée passée par le parent */
  value?: T;
  /** Valeur initiale pour le mode non contrôlé */
  defaultValue?: T;
  /** Callback déclenché lors du changement de valeur */
  onChange?: (value: T) => void;
}

/**
 * Hook headless gérant l'état contrôlé vs non-contrôlé pour les composants React Native.
 * Inspiré de la spécification Radix UI, 100% indépendant de toute dépendance tierce.
 * 
 * - Si `value !== undefined` : le composant est en mode contrôlé (piloté par le parent).
 * - Sinon : le composant gère son propre état interne tout en notifiant via `onChange`.
 */
export function useControllableState<T>({
  value: propValue,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (nextValue: T | ((prev: T) => T)) => void] {
  const isControlled = propValue !== undefined;
  const [internalState, setInternalState] = useState<T>(
    defaultValue as T
  );

  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Avertissement de développement si le mode change dynamiquement
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (isControlledRef.current !== isControlled) {
        console.warn(
          `[rs-ui] Un composant est passé du mode ${
            isControlledRef.current ? "contrôlé" : "non contrôlé"
          } au mode ${isControlled ? "contrôlé" : "non contrôlé"}. ` +
          "La sélection d'un mode doit être statique sur la durée de vie du composant."
        );
      }
    }
  }, [isControlled]);

  const currentValue = isControlled ? (propValue as T) : internalState;

  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(currentValue)
          : nextValue;

      if (!isControlled) {
        setInternalState(resolvedValue);
      }

      if (onChangeRef.current && resolvedValue !== currentValue) {
        onChangeRef.current(resolvedValue);
      }
    },
    [isControlled, currentValue]
  );

  return [currentValue, setValue];
}

export default useControllableState;
