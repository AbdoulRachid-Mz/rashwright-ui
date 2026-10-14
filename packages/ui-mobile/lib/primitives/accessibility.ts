// @/lib/primitives/accessibility.ts
import { AccessibilityRole, AccessibilityState } from "react-native";

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Construit un objet d'accessibilité standardisé pour React Native.
 */
export function buildAccessibilityProps({
  role,
  selected,
  checked,
  disabled,
  expanded,
  busy,
  label,
  hint,
}: {
  role?: AccessibilityRole;
  selected?: boolean;
  checked?: boolean | "mixed";
  disabled?: boolean;
  expanded?: boolean;
  busy?: boolean;
  label?: string;
  hint?: string;
}): AccessibilityProps {
  const accessibilityState: AccessibilityState = {};

  if (selected !== undefined) accessibilityState.selected = selected;
  if (checked !== undefined) accessibilityState.checked = checked;
  if (disabled !== undefined) accessibilityState.disabled = disabled;
  if (expanded !== undefined) accessibilityState.expanded = expanded;
  if (busy !== undefined) accessibilityState.busy = busy;

  return {
    accessible: true,
    accessibilityRole: role,
    accessibilityState: Object.keys(accessibilityState).length > 0 ? accessibilityState : undefined,
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}
