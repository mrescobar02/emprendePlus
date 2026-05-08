/** @format */

import React from "react";

export interface TableCardProps {
  children: React.ReactNode;
}

const TableCard: React.FC<TableCardProps> = ({ children }) => (
  <div className="bg-white border-gray-200 border dark:bg-neutral-800 dark:border-neutral-700 p-4 rounded-xl shadow">
    {children}
  </div>
);

export default TableCard;
