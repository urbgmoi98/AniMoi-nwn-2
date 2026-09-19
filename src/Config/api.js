// Configuración centralizada de la API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://graphql.anilist.co',
  docsURL: 'https://docs.anilist.co',
  format: 'json/graphql',
  authentication: false,
  requestsPerMinute: 90,
  limit: 12,
  maxRetries: 3,
  retryDelay: 1500, // 1.5 segundos
  requestTimeout: 10000,
};
