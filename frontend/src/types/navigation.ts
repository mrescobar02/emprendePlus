// src/types/navigation.ts
import { ReactNode } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  children?: NavItem[];
}
