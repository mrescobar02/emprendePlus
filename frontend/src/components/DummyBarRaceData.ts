// src/data/dummyBarRaceData.ts
import { BarRaceData } from "../hooks/useKeyframes";

const months = [
    "2022-01-01", "2022-02-01", "2022-03-01",
    "2022-04-01", "2022-05-01", "2022-06-01",
    "2022-07-01", "2022-08-01", "2022-09-01",
    "2022-10-01", "2022-11-01", "2022-12-01",
  ];
  
  const products = [
    { name: "Producto A", category: "Ropa", base: 100 },
    { name: "Producto B", category: "Accesorios", base: 80 },
    { name: "Producto C", category: "Calzado", base: 60 },
    { name: "Producto D", category: "Hogar", base: 50 },
    { name: "Producto E", category: "Electrónica", base: 40 },
  ];
  
  export const dummyData: BarRaceData[] = [];
  
  // Para cada producto, acumulamos un valor que aumenta cada mes
  products.forEach(({ name, category, base }) => {
    let prev = base;
    months.forEach((date) => {
      // incremento aleatorio entre 5 y 30
      const delta = Math.floor(Math.random() * 26) + 5;
      const value = prev + delta;
      dummyData.push({ date, name, category, value });
      prev = value;
    });
  });