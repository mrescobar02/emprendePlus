// src/services/financesService.ts

import { FinanceCreate, FinanceRead } from "../types/financeTypes";



const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene todas las transacciones de finanzas para un mes dado,
 * incluyendo el registro virtual de "Ventas Totales".
 * @param token JWT de Auth0
 * @param month Mes en formato "YYYY-MM"
 */
export async function fetchFinances(
  token: string,
): Promise<FinanceRead[]> {
  const res = await fetch(
    `${API_URL}/api/finances/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Error fetching finances");
  }
  return res.json();
}

/**
 * Crea una nueva transacción (ingreso o gasto) en el backend.
 * @param fin Objeto con los campos date, type, category, amount, description
 * @param token JWT de Auth0
 */
export async function createFinance(
  fin: FinanceCreate,
  token: string
): Promise<FinanceRead> {
  const res = await fetch(`${API_URL}/api/finances/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fin),
  });
  if (!res.ok) {
    throw new Error("Error creating finance transaction");
  }
  return res.json();
}

/**
 * Elimina una transacción existente por su ID.
 * @param id ID de la transacción a eliminar
 * @param token JWT de Auth0
 */
export async function deleteFinance(
  id: number,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/finances/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Error deleting finance transaction");
  }
}
