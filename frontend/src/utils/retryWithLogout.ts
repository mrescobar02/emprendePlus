// src/utils/retryWithLogout.ts
/**
 * Intenta ejecutar `fetchFn` hasta `retries` veces.
 * Si falla siempre, redirige a Auth0 (logout) limpiando sesión.
 */
export async function retryWithLogoutFallback<T>(
  fetchFn: () => Promise<T>,
  onFailure: () => void,
  retries = 3,
  delayMs = 2000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn();
    } catch (err) {
      console.warn(`❌ Intento ${i + 1} fallido`, err);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  onFailure();
  return null;
}
