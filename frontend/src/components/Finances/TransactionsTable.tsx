/** @format */

import React, { useState, useMemo } from "react";
import { Transaction } from "./AddTransactionForm";

type Props = {
  data: Transaction[];
  onDelete: (id: string | number) => void;
  itemsPerPage?: number; // número de elementos por página
};

export const TransactionsTable: React.FC<Props> = ({
  data,
  onDelete,
  itemsPerPage = 10,
}) => {
  // Estado para filtro de mes (YYYY-MM)
  const [filterMonth, setFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtrar por mes
  const filteredData = useMemo(() => {
    return data.filter((tx) => tx.date.slice(0, 7) === filterMonth);
  }, [data, filterMonth]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Datos para la página actual
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Generar lista de meses disponibles en data
  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(data.map((tx) => tx.date.slice(0, 7))));
    return months.sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Manejar cambio de mes
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterMonth(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Filtro por Mes */}
      <div className="mb-4 flex items-center space-x-2">
        <label
          htmlFor="month-filter"
          className="text-sm text-gray-700 dark:text-neutral-200"
        >
          Filtrar mes:
        </label>
        <select
          id="month-filter"
          value={filterMonth}
          onChange={handleMonthChange}
          className="border rounded px-2 py-1 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month.replace("-", "/")}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Fecha
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Tipo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Categoría
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Sub-categoría
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Monto
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
            {paginatedData.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-neutral-200">
                  {tx.date}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === "income"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {tx.type === "income" ? "Ingreso" : "Gasto"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-neutral-200">
                  {tx.category}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-neutral-200">
                  {tx.subcategory}
                </td>
                <td
                  className={`px-4 py-2 text-sm font-semibold text-right ${
                    tx.type === "income"
                      ? "text-green-600 dark:text-green-300"
                      : "text-red-600 dark:text-red-300"
                  }`}
                >
                  ${tx.amount.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500 dark:text-neutral-400"
                >
                  No hay transacciones registradas para este mes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-gray-700 dark:text-neutral-200">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
