// src/types/budgetTypes.ts

export interface BudgetCreate {
  category: string;
  subcategory?: string;
  amount: number;
}

export interface BudgetRead extends BudgetCreate {
  id: string;
}
