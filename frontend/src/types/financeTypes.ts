// src/types/financeTypes.ts

export interface FinanceRead {
  id: number;
  business_id: string;
  date: string;         // "YYYY-MM-DD"
  type: "income" | "expense";
  category: string;
  subcategory: string;
  amount: number;
  description?: string;
}

export interface FinanceCreate {
  date: string;         // "YYYY-MM-DD"
  type: "income" | "expense";
  category: string;
  subcategory: string;
  amount: number;
  description?: string;
}
