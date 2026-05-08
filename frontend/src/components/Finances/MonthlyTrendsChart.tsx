/** @format */

// src/components/finances/MonthlyTrendsChart.tsx
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FinanceRead } from "../../types/financeTypes";

export interface ChartPoint {
  period: string; // “2025-06-15” en mes / “2025-06” en año
  income: number;
  expense: number;
  net: number;
}

type Props = {
  transactions: FinanceRead[];
};

export const MonthlyTrendsChart: React.FC<Props> = ({ transactions }) => {
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
  const currentYear = today.getFullYear().toString(); // "YYYY"

  // Agrupa por día o por mes según viewMode
  const chartData: ChartPoint[] = useMemo(() => {
    // Filtrar transacciones según modo
    const filtered = transactions.filter((tx) =>
      viewMode === "month"
        ? tx.date.startsWith(currentMonth)
        : tx.date.startsWith(currentYear)
    );

    // Key: periodo, Value: acumulado
    const map: Record<string, { income: number; expense: number }> = {};

    filtered.forEach((tx) => {
      const period = viewMode === "month" ? tx.date : tx.date.slice(0, 7);
      if (!map[period]) map[period] = { income: 0, expense: 0 };
      if (tx.type === "income") map[period].income += tx.amount;
      else map[period].expense += tx.amount;
    });

    return Object.entries(map)
      .map(([period, vals]) => ({
        period,
        income: parseFloat(vals.income.toFixed(2)),
        expense: parseFloat(vals.expense.toFixed(2)),
        net: parseFloat((vals.income - vals.expense).toFixed(2)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [transactions, viewMode, currentMonth, currentYear]);

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100">
          {viewMode === "month"
            ? "Tendencia Diaria (Mes Actual)"
            : "Tendencia Mensual (Año Actual)"}
        </h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "month" | "year")}
          className="border border-gray-300 dark:border-neutral-600 rounded p-1 bg-white dark:bg-neutral-700 text-gray-800 dark:text-white"
        >
          <option value="month">Día (Mes)</option>
          <option value="year">Mes (Año)</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#4B5563", fillOpacity: 0.8 }}
            stroke="#D1D5DB"
            tickFormatter={
              (val) =>
                viewMode === "month"
                  ? val.slice(8, 10) // muestra solo día "15"
                  : val.replace("-", "/") // muestra "2025/06"
            }
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#4B5563", fillOpacity: 0.8 }}
            stroke="#D1D5DB"
          />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString("es-PA")}`}
            labelFormatter={(label) =>
              viewMode === "month"
                ? `Día ${label}`
                : `Mes ${label.replace("-", "/")}`
            }
            contentStyle={{ backgroundColor: "#FFFFFF", border: "none" }}
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ color: "#6B7280" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Ingresos"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Gastos"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Ganancia Neta"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
