// @/components/templates/auth/components/otp-step.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import OtpInput from "@/components/ui/otp-input";

export interface OtpStepProps {
  onVerify: (otp: string) => void;
  onBackToLogin?: () => void;
  onBack?: () => void;
  onResend?: () => void;
  isLoading?: boolean;
}

export function OtpStep({
  onVerify,
  onBackToLogin,
  onBack,
  onResend,
  isLoading,
}: OtpStepProps) {
  const { theme } = useTheme();
  const [code, setCode] = useState("");
  const handleBack = onBack || onBackToLogin;

  return (
    <View style={styles.container}>
      <Text style={[styles.instruction, { color: theme.colors.mutedForeground }]}>
        Entrez le code à 6 chiffres envoyé sur votre adresse email ou numéro de téléphone.
      </Text>

      <View style={styles.otpWrapper}>
        <OtpInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={onVerify}
        />
      </View>

      <Button
        variant="default"
        size="lg"
        disabled={code.length < 6}
        loading={isLoading}
        onPress={() => onVerify(code)}
        style={styles.verifyBtn}
      >
        Valider le code
      </Button>

      {onResend && (
        <TouchableOpacity onPress={onResend} style={styles.resendBtn}>
          <Text style={[styles.resendText, { color: theme.colors.primary }]}>
            Renvoyer un nouveau code
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <Text style={[styles.backText, { color: theme.colors.mutedForeground }]}>
          ← Retour à la connexion
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: "center" },
  instruction: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  otpWrapper: { marginVertical: 12 },
  verifyBtn: { width: "100%", marginTop: 8 },
  resendBtn: { paddingVertical: 8 },
  resendText: { fontSize: 14, fontWeight: "600" },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 13 },
});
