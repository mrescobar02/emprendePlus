// src/components/BaseTable.tsx
import React from "react";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

function BaseTable<T>({ columns, data }: BaseTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-6 py-3 text-start">
                <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                  {col.header}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {data.map((row, i) => (
            <tr
              key={i}
              className="
                bg-white dark:bg-neutral-800
                hover:bg-gray-100 dark:hover:bg-neutral-700
                transition-colors
              "
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-3 text-gray-800 dark:text-neutral-200 whitespace-nowrap"
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BaseTable;
