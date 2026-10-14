// @/lib/primitives/use-disclosure.ts
import { useCallback } from "react";
import { useControllableState } from "./use-controllable-state";

export interface UseDisclosureProps {
  /** État ouvert en mode contrôlé */
  isOpen?: boolean;
  /** État initial par défaut en mode non contrôlé */
  defaultIsOpen?: boolean;
  /** Callback déclenché à l'ouverture */
  onOpen?: () => void;
  /** Callback déclenché à la fermeture */
  onClose?: () => void;
  /** Callback général de changement d'état */
  onChange?: (isOpen: boolean) => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Hook headless facilitant la gestion d'ouverture/fermeture des composants de dialogue,
 * modales, menus, drawers et sections accordéons en React Native.
 */
export function useDisclosure({
  isOpen: isOpenProp,
  defaultIsOpen = false,
  onOpen,
  onClose,
  onChange,
}: UseDisclosureProps = {}): UseDisclosureReturn {
  const [isOpen, setIsOpenState] = useControllableState<boolean>({
    value: isOpenProp,
    defaultValue: defaultIsOpen,
    onChange,
  });

  const handleOpen = useCallback(() => {
    setIsOpenState(true);
    onOpen?.();
  }, [setIsOpenState, onOpen]);

  const handleClose = useCallback(() => {
    setIsOpenState(false);
    onClose?.();
  }, [setIsOpenState, onClose]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleClose, handleOpen]);

  return {
    isOpen,
    onOpen: handleOpen,
    onClose: handleClose,
    onToggle: handleToggle,
    setIsOpen: setIsOpenState,
  };
}

export default useDisclosure;
