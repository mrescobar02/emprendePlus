/** @format */

// src/components/ChartToolButtons.tsx
import React from "react";

export interface ChartToolButton {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  tooltip?: string;
}

export interface ChartToolButtonsProps {
  buttons: ChartToolButton[];
  className?: string;
}

const ChartToolButtons: React.FC<ChartToolButtonsProps> = ({
  buttons,
  className = "",
}) => (
  <div className={`flex flex-row gap-5 pb-2 ${className}`}>
    {buttons.map((btn, idx) => (
      <button
        key={idx}
        onClick={btn.onClick}
        className={`w-fit p-2 dark:bg-gray-500 rounded-md dark:text-gray-200 cursor-pointer ${
          btn.className ?? ""
        }`}
        title={btn.tooltip}
      >
        {btn.icon}
      </button>
    ))}
  </div>
);

export default ChartToolButtons;
