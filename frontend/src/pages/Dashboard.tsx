/** @format */

import { useEffect, useRef, useState } from "react";
import { useToken } from "../hooks/useToken";

import ChangeBadge from "../components/ChangeBadge";
import ChartCard from "../components/ChartCard";
import StatsCard from "../components/StatsCard";
import ProductWordCloud from "../components/ProductWordCloud";
import MonthlyGoalGauge from "../components/MonthlyGoalGauge";
import SalesHeatmap from "../components/SalesHeatmap";
import GroupedBarChart from "../components/GroupedBarChart";
import LineChart, { DataPoint } from "../components/LineChart";
import LoadingPulse from "../components/LoadingPulse";

import { DashboardStats, WordCloudItem } from "../types/dashboardTypes";
import {
  fetchDashboardStats,
  fetchMonthlySales,
  fetchSalesHeatmapData,
  fetchStarProduct,
  fetchStarProductComparison,
  fetchWordCloudData,
  StarProductResponse,
} from "../services/dashboardServices";
import { MonthlyData } from "../components/types/comparisonChartTypes";

export default function Dashboard() {
  const { getTokenWithRetry } = useToken();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wordcloudData, setWordcloudData] = useState<WordCloudItem[]>([]);
  const [monthlySales, setMonthlySales] = useState<DataPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [_starData, setStarProductSales] = useState<MonthlyData[]>([]);
  const [starProduct, setStarProduct] = useState<StarProductResponse | null>(
    null
  );
  const [monthlyChange, setMonthlyChange] = useState<{
    total: number;
    change: number;
  }>({
    total: 0,
    change: 0,
  });

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      setLoading(true);
      try {
        const token = await getTokenWithRetry();
        if (!token) return;

        const [
          statsData,
          cloudData,
          salesData,
          heatmapData,
          starData,
          starProductData,
        ] = await Promise.all([
          fetchDashboardStats(token),
          fetchWordCloudData(token),
          fetchMonthlySales(token),
          fetchSalesHeatmapData(token),
          fetchStarProductComparison(token),
          fetchStarProduct(token),
        ]);

        setStats(statsData);
        setWordcloudData(cloudData);
        setMonthlySales(salesData);
        setHeatmapData(heatmapData);
        setStarProductSales(starData);
        setStarProduct(starProductData);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const currentMonthSales = salesData.filter(
          (d) =>
            d.date.getMonth() === currentMonth &&
            d.date.getFullYear() === currentYear
        );
        const previousMonthSales = salesData.filter(
          (d) =>
            d.date.getMonth() ===
              (currentMonth === 0 ? 11 : currentMonth - 1) &&
            d.date.getFullYear() ===
              (currentMonth === 0 ? currentYear - 1 : currentYear)
        );

        const currentTotal = currentMonthSales.reduce(
          (sum, d) => sum + d.value,
          0
        );
        const previousTotal = previousMonthSales.reduce(
          (sum, d) => sum + d.value,
          0
        );

        const changePercent =
          previousTotal === 0
            ? 100
            : ((currentTotal - previousTotal) / previousTotal) * 100;

        setMonthlySales(salesData);
        setMonthlyChange({ total: currentTotal, change: changePercent });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getTokenWithRetry]);

  if (loading) {
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );
  }

  // Calculate overallTotal from monthlySales
  const overallTotal = monthlySales.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Ingresos totales"
          tooltip="Ingresos generados en el mes"
          value={
            typeof stats?.total_revenue === "number"
              ? `$${stats.total_revenue.toLocaleString()}`
              : "No disponible"
          }
          change={stats?.revenue_change.toString()}
        />
        <StatsCard
          title="Órdenes totales"
          tooltip="Órdenes recibidas este mes"
          value={
            typeof stats?.total_orders === "number"
              ? `${stats.total_orders.toLocaleString()}`
              : "No disponible"
          }
        />
        <StatsCard
          title="Crecimiento de ventas"
          tooltip="Comparación de ingresos respecto al mes anterior"
          value={
            typeof stats?.growth_rate === "number"
              ? `${stats.growth_rate.toLocaleString()}%`
              : "No disponible"
          }
          change={stats?.growth_change.toString()}
        />
      </div>
      {/* Gráficos principales */}
      <div className="grid sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard
          title="Ventas mensuales"
          value={`$${overallTotal.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`}
          changeBadge={
            monthlyChange.change ? (
              <ChangeBadge percent={parseFloat(monthlyChange.change.toFixed(1))} />
            ) : null
          }
        >
          <LineChart data={monthlySales} />
        </ChartCard>

        <ChartCard
          title={`Producto Estrella: ${starProduct?.name ?? "No disponible"}`}
          value={`$${starProduct?.total_value.toLocaleString("es-PA") ?? "0"}`}
        >
          <GroupedBarChart
            data={starProduct?.monthly_comparison ?? []}
            firstDataTitle="Producto estrella"
            secondDataTitle="Promedio general"
          />
        </ChartCard>
      </div>
      {/* Visualizaciones complementarias */}
      <div className="grid xl:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard title="Productos más vendidos (Nube)">
          <ProductWordCloud words={wordcloudData} />
        </ChartCard>
        <ChartCard title="Progreso hacia la meta mensual">
          <MonthlyGoalGauge current={stats?.total_revenue ?? 0} goal={320} />
        </ChartCard>
        <ChartCard title="Actividad por día y hora">
          <SalesHeatmap data={heatmapData} startHour={8} endHour={20} />
        </ChartCard>
      </div>
    </div>
  );
}
