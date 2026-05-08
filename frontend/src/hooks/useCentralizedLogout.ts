import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

/**
 * Centralized logout hook for Auth0
 * Usage: const logout = useCentralizedLogout(); logout();
 */
export const useCentralizedLogout = () => {
  const { logout } = useAuth0();
  const navigate = useNavigate();
  return () => {
    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/auth`,
      },
    });
    navigate("/auth");
    sessionStorage.clear();
  };
};
