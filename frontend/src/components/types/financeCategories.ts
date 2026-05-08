// src/data/financeCategories.ts
export interface FinanceCategory {
  name: string;
  subcategories: string[];
}

export const financeCategories: FinanceCategory[] = [
  {
    name: "Ingresos",
    subcategories: ["Ventas Online", "Ventas Directas", "Ingresos Extra"],
  },
  {
    name: "Costos",
    subcategories: ["Insumos Agrícolas", "Transporte", "Empaque", "Mano de Obra"],
  },
  {
    name: "Gastos Operativos",
    subcategories: ["Marketing", "Servicios", "Mantenimiento"],
  },
  {
    name: "Inversiones",
    subcategories: ["Equipo y Herramientas", "Infraestructura", "Tecnología"],
  },
  {
    name: "Deudas",
    subcategories: ["Préstamo Bancario", "Microcréditos"],
  },
  {
    name: "Ahorros y Reinversión",
    subcategories: ["Reinversión Negocio", "Fondo Emergencia"],
  },
  {
    name: "Impuestos y Licencias",
    subcategories: [],
  },
  {
    name: "Honorarios y Servicios",
    subcategories: [],
  },
  {
    name: "Seguros",
    subcategories: [],
  },
];
