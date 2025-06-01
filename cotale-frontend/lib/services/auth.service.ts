import { API_CONFIG, getApiUrl } from "@/lib/config/api";
import type { LoginCredentials, RegisterData, AuthResponse, User, AuthError } from "@/lib/types/auth";

export class AuthService {
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  }

  async logout(token: string): Promise<void> {
    await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService(); 