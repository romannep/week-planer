/** Хост сервера API (без завершающего слэша). В dev через Vite можно задать VITE_API_ORIGIN. */
export const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ?? "http://localhost:3000";
