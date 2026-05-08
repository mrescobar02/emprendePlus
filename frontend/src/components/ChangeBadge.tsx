// src/components/ChangeBadge.tsx
import React from "react";

export interface ChangeBadgeProps {
  /** Porcentaje, p.ej. 12.5, -3.2 o "4.1%", "-2%" */
  percent: number | string;
}

const ChangeBadge: React.FC<ChangeBadgeProps> = ({ percent }) => {
  // Convertimos a número para detectar el signo
  const raw =
    typeof percent === "number" ? percent : parseFloat(percent.toString());
  const isUp = raw >= 0;

  const bgClass = isUp
    ? "bg-teal-100 dark:bg-teal-500/10"
    : "bg-red-100 dark:bg-red-500/10";
  const textClass = isUp
    ? "text-teal-800 dark:text-teal-500"
    : "text-red-600 dark:text-red-400";

  const Icon = () =>
    isUp ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 inline-block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V6" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 inline-block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v13" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    );

  // Display: si viene string con '%', lo mostramos; si no, añadimos '%'
  const label =
    typeof percent === "string" && percent.trim().endsWith("%")
      ? percent
      : `${Math.abs(raw)}%`;

  return (
    <span
      className={`py-[5px] px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-md ${bgClass} ${textClass}`}
    >
      <Icon />
      {label}
    </span>
  );
};

export default ChangeBadge;
