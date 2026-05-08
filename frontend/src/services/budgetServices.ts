// src/services/budgetsService.ts

import { BudgetCreate, BudgetRead } from "../types/budgetTypes";


const API_URL = import.meta.env.VITE_API_URL;

export async function fetchBudgets(token: string): Promise<BudgetRead[]> {
  const res = await fetch(`${API_URL}/api/budgets/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error fetching budgets");
  return res.json();
}

export async function upsertBudget(
  data: BudgetCreate,
  token: string
): Promise<BudgetRead> {
  const res = await fetch(`${API_URL}/api/budgets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error setting budget");
  return res.json();
}
