// @/components/ui/form.tsx
/**
 * Composants de formulaire Rashwright UI Mobile.
 *
 * Usage standalone:
 *   <FormField name="email" label="Email" error={errors.email} required>
 *     <TextInput ... />
 *   </FormField>
 *
 * Usage avec react-hook-form (peer dep optionnelle):
 *   const { control, formState: { errors } } = useForm();
 *   <Controller
 *     control={control}
 *     name="email"
 *     render={({ field }) => (
 *       <FormField name="email" label="Email" error={errors.email?.message}>
 *         <TextInput value={field.value} onChangeText={field.onChange} />
 *       </FormField>
 *     )}
 *   />
 */

import React, {
  createContext,
  useContext,
  useId,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";

// ─── Form Context ─────────────────────────────────────────────────────────────

interface FormContextValue {
  /** Optional: react-hook-form methods can be stored here by parent */
  formId: string;
}

const FormContext = createContext<FormContextValue | null>(null);

// ─── FormField Context ────────────────────────────────────────────────────────

interface FormFieldContextValue {
  name: string;
  fieldId: string;
  labelId: string;
  messageId: string;
  descriptionId: string;
  hasError: boolean;
  required: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

// ─── useFormField hook ────────────────────────────────────────────────────────

export function useFormField(): FormFieldContextValue {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error("useFormField must be used inside a <FormField>");
  }
  return ctx;
}

// ─── Form Props ───────────────────────────────────────────────────────────────

export interface FormProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export const Form: React.FC<FormProps> = ({ children, style }) => {
  const formId = useId();

  const contextValue = useMemo<FormContextValue>(
    () => ({ formId }),
    [formId]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <View style={[styles.form, style]}>{children}</View>
    </FormContext.Provider>
  );
};

// ─── FormField Props ──────────────────────────────────────────────────────────

export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// ─── FormField ────────────────────────────────────────────────────────────────

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  description,
  required = false,
  error,
  children,
  style,
}) => {
  const baseId = useId();
  const fieldId = `${baseId}-field`;
  const labelId = `${baseId}-label`;
  const messageId = `${baseId}-message`;
  const descriptionId = `${baseId}-description`;
  const hasError = Boolean(error);

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      name,
      fieldId,
      labelId,
      messageId,
      descriptionId,
      hasError,
      required,
    }),
    [name, fieldId, labelId, messageId, descriptionId, hasError, required]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <View style={[styles.field, style]}>
        {label !== undefined && (
          <FormLabel>{label}</FormLabel>
        )}
        <View accessibilityRole="none" nativeID={fieldId}>
          {children}
        </View>
        {description !== undefined && (
          <FormDescription>{description}</FormDescription>
        )}
        {hasError && error !== undefined && (
          <FormMessage>{error}</FormMessage>
        )}
      </View>
    </FormFieldContext.Provider>
  );
};

// ─── FormLabel ────────────────────────────────────────────────────────────────

export interface FormLabelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const ctx = useContext(FormFieldContext);

  const required = ctx?.required ?? false;
  const hasError = ctx?.hasError ?? false;
  const labelId = ctx?.labelId;

  const textColor = hasError
    ? (theme.colors.destructive ?? "#EF4444")
    : (theme.colors.foreground ?? "#111827");

  return (
    <View style={[styles.labelRow, style]}>
      <Text
        nativeID={labelId}
        style={[styles.labelText, { color: textColor }]}
        accessibilityRole="text"
      >
        {children}
        {required && (
          <Text style={[styles.requiredAsterisk, { color: theme.colors.destructive ?? "#EF4444" }]}>
            {" "}*
          </Text>
        )}
      </Text>
    </View>
  );
};

// ─── FormDescription ──────────────────────────────────────────────────────────

export interface FormDescriptionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const FormDescription: React.FC<FormDescriptionProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();
  const ctx = useContext(FormFieldContext);
  const descriptionId = ctx?.descriptionId;

  const mutedColor = theme.colors.mutedForeground ?? "#6B7280";

  return (
    <Text
      nativeID={descriptionId}
      style={[styles.descriptionText, { color: mutedColor }, style as StyleProp<ViewStyle>]}
      accessibilityRole="text"
    >
      {children}
    </Text>
  );
};

// ─── FormMessage ──────────────────────────────────────────────────────────────

export interface FormMessageProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const FormMessage: React.FC<FormMessageProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const ctx = useContext(FormFieldContext);
  const messageId = ctx?.messageId;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-4);

  const hasMessage = Boolean(children);

  useEffect(() => {
    if (hasMessage) {
      opacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(-4, { duration: 150 });
    }
  }, [hasMessage, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const errorColor = theme.colors.destructive ?? "#EF4444";

  if (!hasMessage) return null;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Text
        nativeID={messageId}
        style={[styles.messageText, { color: errorColor }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {children}
      </Text>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
});

// ─── Default export ───────────────────────────────────────────────────────────

export default Form;
