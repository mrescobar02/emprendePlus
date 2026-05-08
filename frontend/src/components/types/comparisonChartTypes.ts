export interface MonthlyData {
  month: string; // "Jan", "Feb", etc.
  primary: number;   // ventas del producto estrella
  secondary: number; // promedio del resto
}[]