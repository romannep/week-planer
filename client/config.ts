/** Хост сервера API (без завершающего слэша). В prod берётся из .env при сборке (VITE_API_ORIGIN). */
export const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ??
  (import.meta.env.PROD ? "" : "http://localhost:3000");
