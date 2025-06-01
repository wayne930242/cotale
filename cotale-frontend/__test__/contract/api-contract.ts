/**
 * API Contract Definitions
 */

export interface AuthContract {
  // POST /api/v1/auth/register
  register: {
    request: {
      email: string;
      username: string;
      password: string;
    };
    response: {
      id: number;
      email: string;
      username: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    errors: {
      400: { detail: string };
      422: { detail: string };
    };
  };

  // POST /api/v1/auth/login
  login: {
    request: {
      email: string;
      password: string;
    };
    response: {
      access_token: string;
      token_type: string;
    };
    errors: {
      401: { detail: string };
      422: { detail: string };
    };
  };

  // GET /api/v1/auth/me
  getCurrentUser: {
    request: {
      headers: {
        Authorization: string; // "Bearer {token}"
      };
    };
    response: {
      id: number;
      email: string;
      username: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    errors: {
      401: { detail: string };
    };
  };
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    ME: "/api/v1/auth/me",
  },
} as const;
