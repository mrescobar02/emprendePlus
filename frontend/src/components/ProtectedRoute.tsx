import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import FullPageLoader from "./FullPageLoader";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (BYPASS_AUTH) return <>{children}</>;

  if (isLoading) return <FullPageLoader />;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
