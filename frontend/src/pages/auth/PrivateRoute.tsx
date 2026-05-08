/** @format */

// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import FullPageLoader from "../../components/FullPageLoader";

interface PrivateRouteProps {
  children: React.ReactElement;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isLoading, isAuthenticated } = useAuth0();

  // Mientras Auth0 resuelve el estado de autenticación,
  // mostramos un spinner (o pantalla en blanco)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FullPageLoader />
      </div>
    );
  }

  // Si no está autenticado, redirige a /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Ya autenticado → renderiza el hijo
  return children;
}
