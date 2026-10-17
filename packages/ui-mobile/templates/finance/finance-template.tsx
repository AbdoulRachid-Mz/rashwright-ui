// @/components/templates/finance/finance-template.tsx
import React, { useState } from "react";
import WalletScreen from "./wallet-screen";
import TransactionsScreen from "./transactions-screen";
import type { FinanceTemplateProps } from "./types";

export function FinanceTemplate(props: FinanceTemplateProps) {
  const [currentScreen, setCurrentScreen] = useState<"wallet" | "transactions">("wallet");

  if (currentScreen === "transactions") {
    return (
      <TransactionsScreen
        {...props}
        onBack={() => setCurrentScreen("wallet")}
      />
    );
  }

  return (
    <WalletScreen
      {...props}
      onViewAllTransactions={() => setCurrentScreen("transactions")}
    />
  );
}

export default FinanceTemplate;
