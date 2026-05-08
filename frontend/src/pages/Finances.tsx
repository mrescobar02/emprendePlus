/** @format */

// src/pages/FinancesPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../hooks/useToken";

import { ArrowUpCircle, ArrowDownCircle, BarChart2 } from "lucide-react";
import {
  AddTransactionForm,
  Transaction,
} from "../components/Finances/AddTransactionForm";
import { MonthlyTrendsChart } from "../components/Finances/MonthlyTrendsChart";
import { FinanceSummaryCard } from "../components/Finances/FinanceSummaryCard";
import { TransactionsTable } from "../components/Finances/TransactionsTable";
import { BarRaceData, useKeyframes } from "../hooks/useKeyframes";

import { FinanceCreate, FinanceRead } from "../types/financeTypes";
import {
  createFinance,
  deleteFinance,
  fetchFinances,
} from "../services/financesServices";
import Modal from "../components/Modal";
import ChartCard from "../components/ChartCard";
import RacingBarChartWithControls from "../components/RacingBarChartWithControls";
import { fetchSales } from "../services/salesServices";
import LoadingPulse from "../components/LoadingPulse";
import { financeCategories } from "../components/types/financeCategories";

export const FinancesPage: React.FC = () => {
  const navigate = useNavigate();
  const { getTokenWithRetry } = useToken();

  const [transactions, setTransactions] = useState<FinanceRead[]>([]);
  const [barRaceData, setBarRaceData] = useState<BarRaceData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSim, setSelectedSim] = useState<"bar" | null>(null);
  const [loading, setLoading] = useState(true);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const load = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      setLoading(true);
      try {
        const token = await getTokenWithRetry();
        if (!token) return;

        // Finanzas
        const finData = await fetchFinances(token);
        setTransactions(finData);

        // Ventas para gráficas
        const sales = await fetchSales(token);
        const barData: BarRaceData[] = [];
        sales.forEach((sale) => {
          sale.sale_products.forEach((sp) => {
            barData.push({
              date: sale.sale_date,
              name: sp.product_name || sp.product_id,
              value: sp.quantity,
              category: undefined,
            });
          });
        });
        setBarRaceData(barData);
      } catch (err) {
        console.error("Error en carga inicial de FinancesPage:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getTokenWithRetry]);

  const handleAddTransaction = async (tx: Transaction) => {
    const token = await getTokenWithRetry();
    if (!token) return;
    const fin: FinanceCreate = {
      date: tx.date,
      type: tx.type,
      category: tx.category,
      subcategory: tx.subcategory,
      amount: tx.amount,
      description: "",
    };
    const created = await createFinance(fin, token);
    setTransactions((prev) => [created, ...prev]);
  };

  const handleDeleteTransaction = async (id: string | number) => {
    try {
      const token = await getTokenWithRetry();
      if (!token) return;
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      await deleteFinance(numericId, token);
      setTransactions((prev) => prev.filter((tx) => tx.id !== numericId));
    } catch (err) {
      console.error("Error eliminando transacción:", err);
    }
  };

  const totals = useMemo(() => {
    let income = 0,
      expense = 0;
    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    });
    return {
      income: parseFloat(income.toFixed(2)),
      expense: parseFloat(expense.toFixed(2)),
      net: parseFloat((income - expense).toFixed(2)),
    };
  }, [transactions]);

  const keyframes = useKeyframes(barRaceData, 8);

  if (loading)
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      {/* Simulaciones y detalles */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Simulaciones
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          onClick={() => navigate("/finances/details")}
        >
          Ver Detalles
        </button>
      </div>

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setSelectedSim(null);
          }}
        >
          <div className="p-6 min-w-[320px] relative dark:text-neutral-100">
            <h2 className="text-lg font-semibold mb-4">Simulaciones</h2>
            <div className="flex flex-col gap-3">
              <button
                className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 dark:text-gray-800"
                onClick={() => setSelectedSim("bar")}
              >
                Simulación Gráfico de Barras
              </button>
            </div>
            <div className="mt-6">
              {selectedSim === "bar" && (
                <ChartCard title="Productos Estrellas">
                  <RacingBarChartWithControls
                    keyframes={keyframes}
                    numOfBars={10}
                  />
                </ChartCard>
              )}
              {/* Renderizar otras simulaciones según selectedSim */}
            </div>
          </div>
        </Modal>
      )}

      {/* Resumen Ejecutivo */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <FinanceSummaryCard
          title="Ingresos Totales"
          value={totals.income}
          className="bg-green-50 dark:bg-green-900"
          icon={
            <ArrowUpCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
          }
        />
        <FinanceSummaryCard
          title="Gastos Totales"
          value={totals.expense}
          className="bg-red-50 dark:bg-red-900"
          icon={
            <ArrowDownCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
          }
        />
        <FinanceSummaryCard
          title="Ganancia Neta"
          value={totals.net}
          className="bg-blue-50 dark:bg-blue-900"
          icon={
            <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-300" />
          }
        />
      </section>

      {/* Formulario de transacciones */}
      <section className="mb-8">
        <AddTransactionForm
          onAdd={handleAddTransaction}
          categories={financeCategories}
        />
      </section>

      {/* Tabla de transacciones */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 mb-4">
          Historial de Transacciones
        </h2>
        <TransactionsTable
          data={transactions}
          onDelete={handleDeleteTransaction}
          itemsPerPage={5}
        />
      </section>

      {/* Gráfico de tendencias */}
      <section>
        <MonthlyTrendsChart transactions={transactions} />
      </section>
    </div>
  );
};

export default FinancesPage;
