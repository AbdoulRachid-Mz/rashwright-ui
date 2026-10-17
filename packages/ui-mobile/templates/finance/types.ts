// @/components/templates/finance/types.ts

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number; // montant positif ou négatif
  amountFormatted: string; // ex: "+ 2 450,00 €" ou "- 42,50 €"
  date: string;
  icon?: string;
  type: TransactionType;
}

export interface WalletData {
  totalBalance: number;
  totalBalanceFormatted: string;
  currency: string;
  accountNumber: string;
  monthlyIncome: string;
  monthlyExpense: string;
}

export interface FinanceTemplateProps {
  wallet?: WalletData;
  transactions?: Transaction[];
  onSendMoney?: () => void;
  onRequestMoney?: () => void;
  onTopUp?: () => void;
  onViewAllTransactions?: () => void;
  onSelectTransaction?: (id: string) => void;
  onBack?: () => void;
}
