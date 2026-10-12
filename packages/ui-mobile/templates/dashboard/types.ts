// @/components/templates/dashboard/types.ts

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: "success" | "warning" | "default";
}

export interface DashboardTemplateProps {
  userName?: string;
  userRole?: string;
  metrics?: DashboardMetric[];
  activities?: ActivityItem[];
  onRefresh?: () => void;
  onViewAllActivities?: () => void;
}
