import { createContext, useContext } from "react";

// La función que usarán todos los inputs
export const SecurityContext = createContext<{ checkAll: (v: string) => void }>({ checkAll: () => {} });

export const useSecurity = () => useContext(SecurityContext);
