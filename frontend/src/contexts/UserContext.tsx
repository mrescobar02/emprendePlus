/** @format */

// src/contexts/UserContext.tsx
import React, { createContext, useContext } from "react";
import { useUserWithBusiness } from "../hooks/useUserBusiness";

export type UserContextType = {
  userId: string;
  userName: string;
  businessName: string;
  currency: string;
  salesHistory: { date: string; revenue: number }[];
  topProduct: {
    id: string;
    name: string;
    monthlySales: number;
    profitMargin: number;
    supplier: string;
    stock: number;
  };
  productList: {
    id: string;
    name: string;
    monthlySales: number;
    supplier: string;
    stock: number;
  }[];
  refetchUserData: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userData, refetch } = useUserWithBusiness(true);

  if (!userData) {
    return;
  }

  const ctx: UserContextType = {
    userId: userData.id,
    userName: userData.name,
    businessName: userData.business_name || "Mi negocio",
    currency: "USD",
    salesHistory: [],
    topProduct: {
      id: "",
      name: "",
      monthlySales: 0,
      profitMargin: 0,
      supplier: "",
      stock: 0,
    },
    productList: [],
    refetchUserData: refetch,
  };

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>;
};

export function useUserContext(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext debe usarse dentro de UserProvider");
  }
  return ctx;
}
