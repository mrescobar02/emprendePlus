/** @format */

// src/pages/FinancesDetails.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { useToken } from "../hooks/useToken";

import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { RadarChart } from "echarts/charts";

import ChartCard from "../components/ChartCard";
import SunburstChart from "../components/SunBurstChart";

import { BudgetRead } from "../types/budgetTypes";

import { FinanceRead } from "../types/financeTypes";
import { fetchBudgets, upsertBudget } from "../services/budgetServices";
import { fetchFinances } from "../services/financesServices";
import { DataNode } from "../components/SunburstBase";
import LoadingPulse from "../components/LoadingPulse";
import { financeCategories } from "../components/types/financeCategories";

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarChart,
  CanvasRenderer,
]);

export const FinancesDetails: React.FC = () => {
  const navigate = useNavigate();
  const { getTokenWithRetry } = useToken();

  // ──────── estado de carga ────────
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // ─ presupuesto y finanzas ─
  const [budgets, setBudgets] = useState<BudgetRead[]>([]);
  const [finances, setFinances] = useState<FinanceRead[]>([]);

  // ─── modal y edición ───
  const [showBudget, setShowBudget] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<BudgetRead[]>([]);

  // al montar, traemos budgets y finances
  useEffect(() => {
    const load = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      setLoading(true);
      try {
        const token = await getTokenWithRetry();
        if (!token) return;
        const [bData, fData] = await Promise.all([
          fetchBudgets(token),
          fetchFinances(token),
        ]);
        setBudgets(bData);
        setEditingBudgets(bData);
        setFinances(fData);
      } catch (err) {
        console.error("❌ Error cargando datos en FinancesDetails:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getTokenWithRetry]);

  // ───────── dark mode ─────────
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    setIsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ─── lógica de presupuesto (igual que antes) ───
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newSubcategories, setNewSubcategories] = useState<string[]>([]);
  const [newAmount, setNewAmount] = useState(0);
  const categories = financeCategories.map((cat) => cat.name);

  useEffect(() => {
    const category = financeCategories.find((c) => c.name === newCategory);
    const subs = category?.subcategories ?? [];
    setNewSubcategories(subs);
    setNewSubcategory(subs[0] ?? "");
  }, [newCategory]);

  // 2) Monta el DataNode dinámico para Sunburst
  const sunburstDataDynamic = useMemo<DataNode>(() => {
    const root: DataNode = { name: "MiFinanzas", children: [] };

    // Agrupar por tipo: income → "Ingresos", expense → "Gastos"
    ["income", "expense"].forEach((type) => {
      const typeName = type === "income" ? "Ingresos" : "Gastos";
      const grouping: Record<string, Record<string, number>> = {};

      finances
        .filter((f) => f.type === type)
        .forEach((f) => {
          const cat = f.category;
          const sub = f.subcategory ?? "—";
          grouping[cat] = grouping[cat] ?? {};
          grouping[cat][sub] = (grouping[cat][sub] || 0) + f.amount;
        });

      const typeNode = {
        name: typeName,
        children: Object.entries(grouping).map(([cat, subs]) => ({
          name: cat,
          children: Object.entries(subs).map(([sub, val]) => ({
            name: sub,
            value: val,
          })),
        })),
      };

      root.children!.push(typeNode);
    });

    return root;
  }, [finances]);

  const handleSaveBudget = async (b: BudgetRead) => {
    const token = await getTokenWithRetry();
    if (!token) return;
    const updated = await upsertBudget(
      { category: b.category, subcategory: b.subcategory, amount: b.amount },
      token
    );
    setEditingBudgets((prev) =>
      prev.map((x) => (x.id === updated.id ? updated : x))
    );
    setBudgets((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleAddBudget = async () => {
    if (!newCategory || newAmount <= 0) return;
    const token = await getTokenWithRetry();
    if (!token) return;
    const created = await upsertBudget(
      { category: newCategory, subcategory: newSubcategory, amount: newAmount },
      token
    );
    setEditingBudgets((prev) => [...prev, created]);
    setBudgets((prev) => [...prev, created]);
    setNewCategory("");
    setNewAmount(0);
  };

  // ───── datos dinámicos para el radar ─────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const radarData = useMemo(() => {
    return budgets.map((b) => {
      const label = b.subcategory
        ? `${b.category} – ${b.subcategory}`
        : b.category;
      const spending = finances
        .filter(
          (f) =>
            f.type === "expense" &&
            f.date.slice(0, 7) === currentMonth &&
            f.category === b.category &&
            f.subcategory === b.subcategory
        )
        .reduce((sum, f) => sum + f.amount, 0);
      const max = Math.max(b.amount, spending);
      return { label, budget: b.amount, spending, max };
    });
  }, [budgets, finances, currentMonth]);

  // ─── opción de ECharts ───
  const option = useMemo<echarts.EChartsCoreOption>(
    () => ({
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      title: {
        text: "Presupuesto vs Gastado",
        left: "center",
        textStyle: { color: isDark ? "#F3F4F6" : "#1F2937" },
      },
      tooltip: { trigger: "item" },
      legend: {
        data: ["Presupuesto Asignado", "Gasto Real"],
        bottom: 0,
        textStyle: { color: isDark ? "#D1D5DB" : "#374151" },
      },
      radar: {
        indicator: radarData.map((d) => ({ name: d.label, max: d.max })),
        shape: "polygon",
        splitNumber: 5,
        axisName: { color: isDark ? "#E5E7EB" : "#4B5563" },
        splitLine: {
          lineStyle: {
            color: isDark
              ? ["rgba(226,232,240,0.15)"]
              : ["rgba(156,163,175,0.3)"],
          },
        },
        splitArea: {
          areaStyle: {
            color: isDark
              ? ["rgba(30,41,59,0)", "rgba(30,41,59,0.1)"]
              : ["rgba(248,250,252,0)", "rgba(248,250,252,0.5)"],
          },
        },
        axisLine: {
          lineStyle: {
            color: isDark ? "rgba(226,232,240,0.5)" : "rgba(156,163,175,0.5)",
          },
        },
      },
      series: [
        {
          name: "Presupuesto vs Gasto",
          type: "radar",
          data: [
            {
              value: radarData.map((d) => d.budget),
              name: "Presupuesto Asignado",
              areaStyle: { opacity: 0.2, color: "#10B981" },
            },
            {
              value: radarData.map((d) => d.spending),
              name: "Gasto Real",
              areaStyle: { opacity: 0.2, color: "#EF4444" },
            },
          ],
          lineStyle: { width: 2 },
          emphasis: { lineStyle: { width: 3 } },
        },
      ],
    }),
    [isDark, radarData]
  );

  // ─── render ───
  if (loading)
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800 dark:text-neutral-100">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
        >
          ← Volver
        </button>
        <button
          onClick={() => setShowBudget(true)}
          className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Ver/Editar Presupuesto
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Detalles de Finanzas</h1>

      {/* Radar dinámico o mensaje si no hay presupuesto */}
      <ChartCard>
        {radarData.length > 0 ? (
          <ReactECharts
            echarts={echarts}
            option={option}
            style={{ width: "100%", height: 400 }}
          />
        ) : (
          <p className="text-center py-20 text-gray-500">
            No hay presupuesto definido para mostrar el gráfico.
          </p>
        )}
      </ChartCard>

      {showBudget && (
        <Modal onClose={() => setShowBudget(false)}>
          <div className="space-y-4 text-gray-800 dark:text-gray-100">
            <h2 className="text-xl font-semibold">Presupuesto</h2>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Categoría</th>
                  <th className="border px-2 py-1">Subcategoría</th>
                  <th className="border px-2 py-1 text-right">Monto</th>
                  <th className="border px-2 py-1">Acción</th>
                </tr>
              </thead>
              <tbody>
                {editingBudgets.map((b) => (
                  <tr key={b.id}>
                    <td className="border px-2 py-1">{b.category}</td>
                    <td className="border px-2 py-1">{b.subcategory ?? "—"}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={b.amount}
                        onChange={(e) =>
                          setEditingBudgets((prev) =>
                            prev.map((x) =>
                              x.id === b.id
                                ? { ...x, amount: parseFloat(e.target.value) }
                                : x
                            )
                          )
                        }
                        className="w-full text-right border px-1 py-0.5 rounded"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => handleSaveBudget(b)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))}
                {editingBudgets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="border px-2 py-4 text-center">
                      No hay presupuesto definido aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Añadir nuevo presupuesto */}
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
              <h3 className="font-medium mb-2">Agregar nueva categoría</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border px-2 py-1 rounded bg-white dark:bg-neutral-700"
                >
                  <option value="">Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  className="border px-2 py-1 rounded bg-white dark:bg-neutral-700"
                  disabled={!newSubcategories.length}
                >
                  <option value="">Subcategoría</option>
                  {newSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                  placeholder="Monto"
                  className="border px-2 py-1 rounded bg-white dark:bg-neutral-700 text-right"
                />
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Sunburst */}
      <ChartCard className="mt-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-neutral-100">
          Detalle de Ingresos y Gastos
        </h2>
        <SunburstChart data={sunburstDataDynamic} />
      </ChartCard>
    </div>
  );
};

export default FinancesDetails;
