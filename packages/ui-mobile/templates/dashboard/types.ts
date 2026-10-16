// @/components/templates/dashboard/types.ts

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  changeLabel?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: "success" | "warning" | "default";
}

export type DashboardPeriod = "7d" | "30d" | "90d" | "1y";

export interface DashboardTemplateProps {
  userName?: string;
  userRole?: string;
  metrics?: DashboardMetric[];
  activities?: ActivityItem[];
  selectedPeriod?: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
  onRefresh?: () => void;
  onViewAllActivities?: () => void;
  onQuickAction?: (actionId: string) => void;
}
