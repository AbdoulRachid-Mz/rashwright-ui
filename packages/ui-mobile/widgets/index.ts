// @/components/widgets/index.ts

export { MetricWidget } from "./metric";
export type { MetricWidgetProps, MetricTrend } from "./metric";

export { ProgressWidget } from "./progress";
export type { ProgressWidgetProps } from "./progress";

export { QuickActionsWidget } from "./quick-actions";
export type { QuickActionsWidgetProps, QuickActionItem } from "./quick-actions";

export { ChartWidget } from "./chart";
export type { ChartWidgetProps, ChartDataPoint, ChartType } from "./chart";

export { ActivityFeedWidget } from "./activity-feed";
export type {
  ActivityFeedWidgetProps,
  ActivityFeedItem,
  ActivityStatus,
  ActivityAmountType,
} from "./activity-feed";

export { FinanceWidget } from "./finance";
export type { FinanceWidgetProps, FinanceActionShortcut } from "./finance";
