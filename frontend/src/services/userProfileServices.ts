// src/services/userProfileServices.ts

import { retryWithLogoutFallback } from "../utils/retryWithLogout";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function registerUserSession(
  user: { sub: string; email: string; name: string },
  token: string,
  onBan: () => void,
  logout: () => void
) {
  return retryWithLogoutFallback(
    async () => {
      const res = await fetch(`${API_BASE_URL}/api/register-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.sub,
          email: user.email,
          name: user.name,
        }),
      });

      if (res.status === 403) {
        onBan();
        return;
      }

      if (!res.ok) throw new Error("Error al registrar sesión");
      return res.json();
    },
    logout
  );
}

export async function getUserProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error al obtener el perfil de usuario");
  return res.json();
}
