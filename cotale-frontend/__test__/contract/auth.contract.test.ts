/**
 * Contract Tests for Authentication API
 */

import { authService } from "@/lib/services/auth.service";
import { schemaValidator } from "./schema-validator";

// Mock fetch for contract testing
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Auth API Contract Tests (OpenAPI Schema Based)", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Schema Validator Setup", () => {
    it("should load OpenAPI schema correctly", () => {
      const endpoints = schemaValidator.getAvailableEndpoints();
      expect(endpoints.length).toBeGreaterThan(0);
      
      const authEndpoints = endpoints.filter(ep => ep.path.includes('/auth/'));
      expect(authEndpoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "/api/v1/auth/register", method: "POST" }),
          expect.objectContaining({ path: "/api/v1/auth/login", method: "POST" }),
          expect.objectContaining({ path: "/api/v1/auth/me", method: "GET" }),
        ])
      );
    });
  });

  describe("Registration Contract", () => {
    it("should send request that conforms to OpenAPI schema", async () => {
      const requestData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      // 驗證請求資料符合 schema
      const requestValidation = schemaValidator.validateRequest(
        "/api/v1/auth/register", 
        "POST", 
        requestData
      );
      expect(requestValidation.valid).toBe(true);
      if (!requestValidation.valid) {
        console.log("Request validation errors:", requestValidation.errors);
      }

      // Mock 符合 schema 的回應
      const responseData = {
        id: 1,
        email: requestData.email,
        username: requestData.username,
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      // 驗證回應資料符合 schema
      const responseValidation = schemaValidator.validateResponse(
        "/api/v1/auth/register",
        "POST",
        200,
        responseData
      );
      expect(responseValidation.valid).toBe(true);
      if (!responseValidation.valid) {
        console.log("Response validation errors:", responseValidation.errors);
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      } as Response);

      const result = await authService.register(requestData);

      // 驗證 API 呼叫格式
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/register"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestData),
        })
      );

      // 驗證回應符合 User schema
      const userSchemaValidation = schemaValidator.validateSchema("User", result);
      expect(userSchemaValidation.valid).toBe(true);
      if (!userSchemaValidation.valid) {
        console.log("User schema validation errors:", userSchemaValidation.errors);
      }
    });

    it("should handle validation errors according to OpenAPI schema", async () => {
      const invalidData = {
        email: "invalid-email", // 不符合 email format
        username: "",
        password: "",
      };

      // 驗證這個請求確實不符合 schema
      const requestValidation = schemaValidator.validateRequest(
        "/api/v1/auth/register",
        "POST",
        invalidData
      );
      expect(requestValidation.valid).toBe(false);

      // Mock 422 錯誤回應
      const errorResponse = {
        detail: [
          {
            loc: ["body", "email"],
            msg: "field required",
            type: "value_error.missing"
          }
        ]
      };

      // 驗證錯誤回應符合 schema
      const errorValidation = schemaValidator.validateResponse(
        "/api/v1/auth/register",
        "POST",
        422,
        errorResponse
      );
      expect(errorValidation.valid).toBe(true);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => errorResponse,
      } as Response);

      await expect(authService.register(invalidData)).rejects.toThrow();
    });
  });

  describe("Login Contract", () => {
    it("should send request that conforms to OpenAPI schema", async () => {
      const requestData = {
        email: "test@example.com",
        password: "password123",
      };

      // 驗證請求資料符合 UserLogin schema
      const requestValidation = schemaValidator.validateSchema("UserLogin", requestData);
      expect(requestValidation.valid).toBe(true);

      // Mock 符合 Token schema 的回應
      const responseData = {
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        token_type: "bearer",
      };

      // 驗證回應符合 Token schema
      const tokenValidation = schemaValidator.validateSchema("Token", responseData);
      expect(tokenValidation.valid).toBe(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      } as Response);

      const result = await authService.login(requestData);

      // 驗證 API 呼叫格式
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestData),
        })
      );

      // 驗證回應符合 Token schema
      const resultValidation = schemaValidator.validateSchema("Token", result);
      expect(resultValidation.valid).toBe(true);
    });
  });

  describe("Get Current User Contract", () => {
    it("should call endpoint with correct authorization and return User schema", async () => {
      const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...";

      // Mock 符合 User schema 的回應
      const responseData = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: null, // 測試 optional field
      };

      // 驗證回應符合 User schema
      const userValidation = schemaValidator.validateSchema("User", responseData);
      expect(userValidation.valid).toBe(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      } as Response);

      const result = await authService.getCurrentUser(token);

      // 驗證 API 呼叫格式
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/me"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );

      // 驗證回應符合 User schema
      const resultValidation = schemaValidator.validateSchema("User", result);
      expect(resultValidation.valid).toBe(true);
    });

    it("should handle unauthorized access with proper error format", async () => {
      const errorResponse = {
        detail: "Not authenticated"
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response);

      await expect(authService.getCurrentUser("invalid-token")).rejects.toThrow();
    });
  });

  describe("Schema Compliance Tests", () => {
    it("should validate all required fields in UserCreate schema", () => {
      const completeData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      const validation = schemaValidator.validateSchema("UserCreate", completeData);
      expect(validation.valid).toBe(true);

      // 測試缺少必要欄位
      const incompleteData = {
        email: "test@example.com",
        // missing username and password
      };

      const invalidValidation = schemaValidator.validateSchema("UserCreate", incompleteData);
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toBeDefined();
    });

    it("should validate email format in schemas", () => {
      const invalidEmailData = {
        email: "not-an-email",
        username: "testuser",
        password: "password123",
      };

      const validation = schemaValidator.validateSchema("UserCreate", invalidEmailData);
      expect(validation.valid).toBe(false);
      expect(validation.errors?.some(error => error.instancePath === "/email")).toBe(true);
    });

    it("should validate datetime format in User schema", () => {
      const invalidDateData = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_active: true,
        created_at: "not-a-date",
        updated_at: null,
      };

      const validation = schemaValidator.validateSchema("User", invalidDateData);
      expect(validation.valid).toBe(false);
      expect(validation.errors?.some(error => error.instancePath === "/created_at")).toBe(true);
    });
  });

  describe("API Endpoint Discovery", () => {
    it("should discover all authentication endpoints from OpenAPI schema", () => {
      const endpoints = schemaValidator.getAvailableEndpoints();
      const authEndpoints = endpoints.filter(ep => ep.path.includes('/auth/'));

      expect(authEndpoints).toHaveLength(4); // register, login, me, logout
      
      const endpointPaths = authEndpoints.map(ep => `${ep.method} ${ep.path}`);
      expect(endpointPaths).toContain("POST /api/v1/auth/register");
      expect(endpointPaths).toContain("POST /api/v1/auth/login");
      expect(endpointPaths).toContain("GET /api/v1/auth/me");
      expect(endpointPaths).toContain("POST /api/v1/auth/logout");
    });
  });
});
