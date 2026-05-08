import { CreateSaleInput, DetailedSale, SaleFromAPI } from "../types/saleTypes";



export async function fetchSales(token: string): Promise<SaleFromAPI[]> {
  const res = await fetch("/api/sales/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error fetching sales");
  }

  return res.json();
}


export async function fetchSaleById(id: string, token: string): Promise<DetailedSale> {
  const res = await fetch(`/api/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error fetching sale");
  }

  return res.json();
}

export async function createSale(input: CreateSaleInput, token: string) {
  const res = await fetch("/api/sales/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || "Error al crear la venta");
  }

  return await res.json();
}