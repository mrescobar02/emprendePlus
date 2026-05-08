/** @format */

import React, { useState, useMemo } from "react";
import BaseTable, { Column } from "./BaseTable";

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  toolbar?: React.ReactNode;
  title: string;
  itemsPerPage?: number;
}

function DataTable<T>({
  columns,
  data,
  toolbar,
  title,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Datos para la página actual
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow space-y-4">
      <div className="flex justify-between items-center">
        {title && (
          <h2 className="lg:text-lg xl:text-xl font-semibold text-gray-800 dark:text-neutral-200">
            {title}
          </h2>
        )}
        {toolbar && <div>{toolbar}</div>}
      </div>

      <BaseTable columns={columns} data={paginatedData} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-gray-700 dark:text-neutral-200">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
