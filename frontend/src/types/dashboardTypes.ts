export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  growth_rate: number;
  revenue_change: number;
  growth_change: number;
  top_product?: {
    sku: string;
    name: string;
    total_sold: number;
    previous_month_sold: number;
    revenue: number;
  };
}

export interface WordCloudItem {
  text: string;
  value: number;
}