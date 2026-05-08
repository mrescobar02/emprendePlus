/** @format */

// src/components/ViewToggleButton.tsx
import React from "react";

export interface ViewToggleButtonProps {
  /** Tipo de vista que representa este botón */
  viewType: "grid" | "list";
  /** Vista actualmente activa */
  currentView: "grid" | "list";
  /** Callback al cambiar la vista */
  onClick: (view: "grid" | "list") => void;
  /** Texto accesible para aria-label */
  label: string;
  /** Icono o contenido interno */
  icon: React.ReactNode;
}

/**
 * Botón genérico para alternar entre modos de vista (grid/list).
 */
const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  viewType,
  currentView,
  onClick,
  label,
  icon,
}) => {
  const isActive = viewType === currentView;

  return (
    <button
      type="button"
      onClick={() => onClick(viewType)}
      className={
        `flex gap-2 p-2 rounded transition-colors items-center focus:outline-none ` +
        (isActive
          ? `bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-white`
          : `text-gray-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700`)
      }
    >
      {icon}

      {label}
    </button>
  );
};

export default ViewToggleButton;
