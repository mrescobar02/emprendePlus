import { SaleFromAPI } from "../types/saleTypes";

export function computeSalesStats(sales: SaleFromAPI[]) {
  const monthSales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    const now = new Date();
    return (
      saleDate.getFullYear() === now.getFullYear() &&
      saleDate.getMonth() === now.getMonth()
    );
  });

  const totalRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = monthSales.length;
  const averageValue = totalOrders ? totalRevenue / totalOrders : 0;

  const totalItems = monthSales.reduce((sum, s) => {
    return sum + s.sale_products.reduce((acc, p) => acc + p.quantity, 0);
  }, 0);

  return {
    totalRevenue,
    totalOrders,
    averageValue,
    totalItems,
  };
}