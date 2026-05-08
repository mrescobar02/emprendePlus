const AVATAR_KEY = "user_avatar_url";

export const saveAvatarToCache = (url: string) => {
  try {
    localStorage.setItem(AVATAR_KEY, url);
  } catch (e) {
    console.warn("No se pudo guardar el avatar en cache", e);
  }
};

export const getCachedAvatar = (): string | null => {
  try {
    return localStorage.getItem(AVATAR_KEY);
  } catch (e) {
    return null;
  }
};

export const clearCachedAvatar = () => {
  try {
    localStorage.removeItem(AVATAR_KEY);
  } catch (e) {
    // silent
  }
};
