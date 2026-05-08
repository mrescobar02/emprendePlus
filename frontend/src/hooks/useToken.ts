import { useAuthService } from "../services/authServices";
import { useCallback, useRef } from "react";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

export const useToken = () => {
  const { getToken, logoutUser } = useAuthService();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const logoutRef = useRef(logoutUser);
  logoutRef.current = logoutUser;

  const getTokenWithRetry = useCallback(
    async (retries = 3, delayMs = 1000): Promise<string | null> => {
      if (BYPASS_AUTH) return "bypass";

      for (let i = 0; i < retries; i++) {
        try {
          return await getTokenRef.current();
        } catch (err: any) {
          console.warn(`🔁 Token retry ${i + 1} failed`, err);
          const errorCode = err?.error || err?.message;
          if (
            errorCode === "login_required" ||
            errorCode === "consent_required" ||
            errorCode?.includes("Missing Refresh Token")
          ) {
            logoutRef.current();
            return null;
          }
          if (i < retries - 1) await new Promise((res) => setTimeout(res, delayMs));
        }
      }

      logoutRef.current();
      return null;
    },
    [] // stable: always reads latest getToken/logoutUser via refs
  );

  return { getTokenWithRetry };
};
