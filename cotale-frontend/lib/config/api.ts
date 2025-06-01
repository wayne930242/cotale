export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  VERSION: "v1",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      ME: "/auth/me",
      LOGOUT: "/auth/logout",
    },
    DOCUMENTS: {
      LIST: "/documents",
      CREATE: "/documents",
      GET: (id: string) => `/documents/${id}`,
      UPDATE: (id: string) => `/documents/${id}`,
      DELETE: (id: string) => `/documents/${id}`,
    },
    WEBSOCKET: {
      CONNECT: (documentId: string) => `/ws/${documentId}`,
    },
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}${endpoint}`;
}; 