import { useAuth0 } from "@auth0/auth0-react";
import { useCentralizedLogout } from "./useCentralizedLogout";
import { useToken } from "./useToken";
import { useCallback, useEffect, useRef, useState } from "react";
import { retryWithLogoutFallback } from "../utils/retryWithLogout";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
const BYPASS_USER_SUB = "dev|bypass-001";

interface Business {
  id: string;
  name: string;
  description: string;
}

interface UserWithBusiness {
  id: string;
  name: string;
  business_name: string | null;
  business: Business;
}

export const useUserWithBusiness = (enabled = true) => {
  const { user, isAuthenticated } = useAuth0();
  const { getTokenWithRetry } = useToken();
  const centralizedLogout = useCentralizedLogout();
  const [userData, setUserData] = useState<UserWithBusiness>();
  const API_URL = import.meta.env.VITE_API_URL;
  const hasFetchedRef = useRef(false);

  const fetchUserData = useCallback(async () => {
    const token = await getTokenWithRetry();
    if (!token) return;
    const sub = BYPASS_AUTH ? BYPASS_USER_SUB : user?.sub;
    if (!sub) return;

    const result = await retryWithLogoutFallback<UserWithBusiness>(
      async () => {
        const response = await fetch(
          `${API_URL}/api/users/${encodeURIComponent(sub)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch user profile");
        return await response.json();
      },
      centralizedLogout
    );

    if (result) setUserData(result);
  }, [API_URL, getTokenWithRetry, user?.sub]);

  useEffect(() => {
    if (!enabled) return;
    if (hasFetchedRef.current) return;
    if (!BYPASS_AUTH && !(isAuthenticated && user)) return;
    hasFetchedRef.current = true;
    fetchUserData();
  }, [enabled, isAuthenticated, user, fetchUserData]);

  return { userData, refetch: fetchUserData };
};
