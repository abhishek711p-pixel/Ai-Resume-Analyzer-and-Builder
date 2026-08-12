/**
 * API Endpoint Resolver
 * 
 * Dynamically resolves the backend API URLs based on the build environment:
 * 1. In Local Development (Vite `import.meta.env.DEV` is true), resolves to `http://localhost:5001`.
 * 2. In Production (e.g. deployed on Vercel), resolves to `VITE_API_URL` env variable,
 *    or falls back to relative paths if hosted under a reverse proxy.
 * 
 * @param {string} path - The API endpoint suffix (e.g. '/api/auth/login')
 * @returns {string} Fully resolved API URL
 */
export const getApiUrl = (path: string): string => {
  const base = import.meta.env.DEV
    ? 'http://localhost:5001'
    : (import.meta.env.VITE_API_URL || '');
  return `${base}${path}`;
};
