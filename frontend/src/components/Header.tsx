import { useEffect, useState } from "react";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import {
  getCachedAvatar,
  saveAvatarToCache,
  clearCachedAvatar,
} from "../utils/avatarCache";
import { useUserContext } from "../contexts/UserContext";
import { useCentralizedLogout } from "../hooks/useCentralizedLogout";

const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const { businessName } = useUserContext();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const centralizedLogout = useCentralizedLogout();

  // 1. Al cargar, busca la imagen cacheada (solo cuando no es bypass)
  useEffect(() => {
    if (BYPASS_AUTH) return;
    const cached = getCachedAvatar();
    if (cached) {
      setAvatarUrl(cached);
    }
  }, []);

  // 2. Cuando se detecta un nuevo usuario logueado, guarda la imagen si no estaba guardada
  useEffect(() => {
    if (BYPASS_AUTH) return;
    if (user?.picture && avatarUrl !== user.picture) {
      saveAvatarToCache(user.picture);
      setAvatarUrl(user.picture);
    }
  }, [user?.picture]);

  useEffect(() => {
    if (BYPASS_AUTH) return;
    if (!isLoading && !isAuthenticated && location.pathname !== "/auth") {
      clearCachedAvatar();
      centralizedLogout();
    }
  }, [isLoading, isAuthenticated, location.pathname, centralizedLogout]);

  return (
    <header className="sticky top-0 z-48 w-full bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
      <nav className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2" />
        <div className="flex items-center gap-2">
          {(BYPASS_AUTH || (isAuthenticated && user)) && (
            <UserDropdown
              userName={BYPASS_AUTH ? "Dev User" : (user?.name || "Usuario")}
              businessName={businessName}
              email={BYPASS_AUTH ? "dev@localhost.com" : (user?.email || "")}
              avatarUrl={BYPASS_AUTH ? undefined : avatarUrl}
              onLogout={centralizedLogout}
            />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
