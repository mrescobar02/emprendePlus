/** @format */

// src/components/finances/FinanceSummaryCard.tsx
import React from "react";

type Props = {
  title: string;
  value: number;
  className?: string;
  icon?: React.ReactNode;
};

export const FinanceSummaryCard = ({
  title,
  value,
  className = "",
  icon,
}: Props) => {
  return (
    <div
      className={`
        flex items-center p-4 rounded-2xl shadow-lg 
        bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700
        ${className}
      `}
    >
      {icon && <div className="mr-3">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
          {title}
        </p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-neutral-100">
          ${value.toLocaleString("es-PA")}
        </p>
      </div>
    </div>
  );
};
