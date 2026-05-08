/** @format */

// src/components/EmprendePlusLogo2.tsx
import React from "react";
import EmprendePlusIcon from "./EmprendePlusIcon";

/**
 * Componente de logo de EmprendePlus con icono y texto
 */
const EmprendePlusLogo: React.FC = () => (
  <div className="flex items-center ">
    {/* Icono personalizado */}
    <div className="w-8 h-8 text-white">
      <EmprendePlusIcon />
    </div>
    {/* Texto junto al icono */}
    <span className="text-2xl font-bold text-white select-none">Emprende+</span>
  </div>
);

export default EmprendePlusLogo;
