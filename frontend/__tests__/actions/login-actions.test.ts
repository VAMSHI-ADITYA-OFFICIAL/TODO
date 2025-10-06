import { loginUser, logoutUser } from "../../app/login/actions";

// Mock fetch globally
global.fetch = jest.fn();

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// Mock fetchWithAuth
jest.mock("../../lib/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

describe("Login Actions", () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const mockCookies = require("next/headers").cookies;
  const mockFetchWithAuth = require("../../lib/auth").fetchWithAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.NODE_ENV;
  });

  describe("loginUser", () => {
    const validLoginData = {
      email: "user@example.com",
      password: "password123",
    };

    it("should successfully login a user with valid credentials", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "access-token-123",
          refreshToken: "refresh-token-456",
          user: { id: "1", email: "user@example.com", name: "Test User" },
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginData),
      });

      expect(mockCookieSet).toHaveBeenCalledTimes(2);
      expect(mockCookieSet).toHaveBeenNthCalledWith(1, {
        name: "refreshToken",
        value: "refresh-token-456",
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      expect(mockCookieSet).toHaveBeenNthCalledWith(2, {
        name: "accessToken",
        value: "access-token-123",
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 15, // 15 min
      });

      expect(result).toEqual({
        result: {
          accessToken: "access-token-123",
          refreshToken: "refresh-token-456",
          user: { id: "1", email: "user@example.com", name: "Test User" },
        },
      });
    });

    it("should handle login with different user credentials", async () => {
      const differentLoginData = {
        email: "admin@example.com",
        password: "adminpassword456",
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "admin-access-token",
          refreshToken: "admin-refresh-token",
          user: { id: "2", email: "admin@example.com", name: "Admin User" },
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(differentLoginData);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(differentLoginData),
      });

      expect(result).toEqual({
        result: {
          accessToken: "admin-access-token",
          refreshToken: "admin-refresh-token",
          user: { id: "2", email: "admin@example.com", name: "Admin User" },
        },
      });
    });

    it("should handle server error response", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Invalid credentials",
          status: 401,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await loginUser(validLoginData);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginData),
      });

      expect(result).toEqual({
        error: "Invalid credentials",
        status: 401,
      });
    });

    it("should handle validation error from server", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Email is required",
          status: 422,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await loginUser(validLoginData);

      expect(result).toEqual({
        error: "Email is required",
        status: 422,
      });
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(loginUser(validLoginData)).rejects.toThrow("Network error");
    });

    it("should handle fetch timeout", async () => {
      mockFetch.mockRejectedValue(new Error("Request timeout"));

      await expect(loginUser(validLoginData)).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should handle server error with different status codes", async () => {
      const testCases = [
        { status: 500, error: "Internal server error" },
        { status: 403, error: "Account locked" },
        { status: 422, error: "Validation failed" },
        { status: 400, error: "Bad request" },
      ];

      for (const testCase of testCases) {
        const mockErrorResponse = {
          ok: false,
          json: jest.fn().mockResolvedValue({
            error: testCase.error,
            status: testCase.status,
          }),
        };

        mockFetch.mockResolvedValue(mockErrorResponse as any);

        const result = await loginUser(validLoginData);

        expect(result).toEqual({
          error: testCase.error,
          status: testCase.status,
        });
      }
    });

    it("should handle empty response from server", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(result).toEqual({ result: {} });
    });

    it("should handle response with null tokens", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: null,
          refreshToken: null,
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(mockCookieSet).toHaveBeenCalledWith({
        name: "refreshToken",
        value: null,
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      expect(result).toEqual({
        result: {
          accessToken: null,
          refreshToken: null,
        },
      });
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(loginUser(validLoginData)).rejects.toThrow("Invalid JSON");
    });

    it("should handle error response with malformed JSON", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      await expect(loginUser(validLoginData)).rejects.toThrow("Invalid JSON");
    });

    it("should handle user data with special characters", async () => {
      const specialCharData = {
        email: "josé.maría@example.com",
        password: "p@ssw0rd!@#$%",
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "special-access-token",
          refreshToken: "special-refresh-token",
          user: {
            id: "3",
            email: "josé.maría@example.com",
            name: "José María",
          },
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(specialCharData);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specialCharData),
      });

      expect(result).toEqual({
        result: {
          accessToken: "special-access-token",
          refreshToken: "special-refresh-token",
          user: {
            id: "3",
            email: "josé.maría@example.com",
            name: "José María",
          },
        },
      });
    });

    it("should handle user data with very long strings", async () => {
      const longStringData = {
        email: "verylongemail@example.com",
        password: "B".repeat(1000),
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "long-access-token",
          refreshToken: "long-refresh-token",
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(longStringData);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(longStringData),
      });

      expect(result).toEqual({
        result: {
          accessToken: "long-access-token",
          refreshToken: "long-refresh-token",
        },
      });
    });

    it("should handle user data with empty strings", async () => {
      const emptyStringData = {
        email: "",
        password: "",
      };

      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Email and password are required",
          status: 400,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await loginUser(emptyStringData);

      expect(result).toEqual({
        error: "Email and password are required",
        status: 400,
      });
    });

    it("should handle user data with whitespace only", async () => {
      const whitespaceData = {
        email: "   ",
        password: "   ",
      };

      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Invalid input data",
          status: 400,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await loginUser(whitespaceData);

      expect(result).toEqual({
        error: "Invalid input data",
        status: 400,
      });
    });

    it("should handle concurrent login requests", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "concurrent-access-token",
          refreshToken: "concurrent-refresh-token",
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const promises = [
        loginUser({ ...validLoginData, email: "user1@example.com" }),
        loginUser({ ...validLoginData, email: "user2@example.com" }),
        loginUser({ ...validLoginData, email: "user3@example.com" }),
      ];

      const results = await Promise.all(promises);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toEqual({
          result: {
            accessToken: "concurrent-access-token",
            refreshToken: "concurrent-refresh-token",
          },
        });
      });
    });

    it("should handle environment variable not set", async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "env-test-token",
          refreshToken: "env-test-refresh",
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(mockFetch).toHaveBeenCalledWith("undefined/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginData),
      });

      expect(result).toEqual({
        result: {
          accessToken: "env-test-token",
          refreshToken: "env-test-refresh",
        },
      });
    });

    it("should handle different environment variable values", async () => {
      const testUrls = [
        "https://api.example.com",
        "http://localhost:8080",
        "https://staging.example.com",
      ];

      for (const url of testUrls) {
        process.env.NEXT_PUBLIC_BASE_URL = url;

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            accessToken: "env-access-token",
            refreshToken: "env-refresh-token",
          }),
        };

        const mockCookieSet = jest.fn();
        mockCookies.mockResolvedValue({
          set: mockCookieSet,
        });

        mockFetch.mockResolvedValue(mockResponse as any);

        const result = await loginUser(validLoginData);

        expect(mockFetch).toHaveBeenCalledWith(`${url}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validLoginData),
        });

        expect(result).toEqual({
          result: {
            accessToken: "env-access-token",
            refreshToken: "env-refresh-token",
          },
        });
      }
    });

    it("should handle production environment settings", async () => {
      process.env.NODE_ENV = "production";

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "prod-access-token",
          refreshToken: "prod-refresh-token",
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(mockCookieSet).toHaveBeenCalledWith({
        name: "refreshToken",
        value: "prod-refresh-token",
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      expect(mockCookieSet).toHaveBeenCalledWith({
        name: "accessToken",
        value: "prod-access-token",
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 15,
      });

      expect(result).toEqual({
        result: {
          accessToken: "prod-access-token",
          refreshToken: "prod-refresh-token",
        },
      });
    });

    it("should handle response with nested user data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "nested-access-token",
          refreshToken: "nested-refresh-token",
          user: {
            id: "123",
            email: "user@example.com",
            name: "Test User",
            profile: {
              avatar: "avatar.jpg",
              preferences: {
                theme: "dark",
                notifications: true,
              },
            },
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(result).toEqual({
        result: {
          accessToken: "nested-access-token",
          refreshToken: "nested-refresh-token",
          user: {
            id: "123",
            email: "user@example.com",
            name: "Test User",
            profile: {
              avatar: "avatar.jpg",
              preferences: {
                theme: "dark",
                notifications: true,
              },
            },
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        },
      });
    });

    it("should handle response with array data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "array-access-token",
          refreshToken: "array-refresh-token",
          permissions: ["read", "write", "admin"],
          roles: ["user", "moderator"],
        }),
      };

      const mockCookieSet = jest.fn();
      mockCookies.mockResolvedValue({
        set: mockCookieSet,
      });

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await loginUser(validLoginData);

      expect(result).toEqual({
        result: {
          accessToken: "array-access-token",
          refreshToken: "array-refresh-token",
          permissions: ["read", "write", "admin"],
          roles: ["user", "moderator"],
        },
      });
    });
  });

  describe("logoutUser", () => {
    it("should successfully logout a user", async () => {
      const mockResponse = { success: true };
      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const mockCookieDelete = jest.fn();
      mockCookies.mockResolvedValue({
        delete: mockCookieDelete,
      });

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(mockCookieDelete).toHaveBeenCalledTimes(2);
      expect(mockCookieDelete).toHaveBeenNthCalledWith(1, "accessToken");
      expect(mockCookieDelete).toHaveBeenNthCalledWith(2, "refreshToken");

      expect(result).toEqual({ success: true });
    });

    it("should handle logout when fetchWithAuth returns null", async () => {
      mockFetchWithAuth.mockResolvedValue(null);

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(result).toBeUndefined();
    });

    it("should handle logout when fetchWithAuth returns undefined", async () => {
      mockFetchWithAuth.mockResolvedValue(undefined);

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(result).toBeUndefined();
    });

    it("should handle logout when fetchWithAuth returns false", async () => {
      mockFetchWithAuth.mockResolvedValue(false);

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(result).toBeUndefined();
    });

    it("should handle logout when fetchWithAuth returns empty object", async () => {
      mockFetchWithAuth.mockResolvedValue({});

      const mockCookieDelete = jest.fn();
      mockCookies.mockResolvedValue({
        delete: mockCookieDelete,
      });

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(mockCookieDelete).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should handle logout when fetchWithAuth returns string", async () => {
      mockFetchWithAuth.mockResolvedValue("logout successful");

      const mockCookieDelete = jest.fn();
      mockCookies.mockResolvedValue({
        delete: mockCookieDelete,
      });

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(mockCookieDelete).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should handle logout when fetchWithAuth returns number", async () => {
      mockFetchWithAuth.mockResolvedValue(200);

      const mockCookieDelete = jest.fn();
      mockCookies.mockResolvedValue({
        delete: mockCookieDelete,
      });

      const result = await logoutUser();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      expect(mockCookieDelete).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should handle logout when fetchWithAuth throws an error", async () => {
      mockFetchWithAuth.mockRejectedValue(new Error("Network error"));

      await expect(logoutUser()).rejects.toThrow("Network error");
    });

    it("should handle logout when fetchWithAuth throws a timeout error", async () => {
      mockFetchWithAuth.mockRejectedValue(new Error("Request timeout"));

      await expect(logoutUser()).rejects.toThrow("Request timeout");
    });

    it("should handle logout with different response types", async () => {
      const testCases = [
        { response: { status: "success" }, expected: { success: true } },
        { response: { message: "Logged out" }, expected: { success: true } },
        { response: [], expected: { success: true } },
        { response: "success", expected: { success: true } },
        { response: 1, expected: { success: true } },
        { response: true, expected: { success: true } },
      ];

      for (const testCase of testCases) {
        mockFetchWithAuth.mockResolvedValue(testCase.response);

        const mockCookieDelete = jest.fn();
        mockCookies.mockResolvedValue({
          delete: mockCookieDelete,
        });

        const result = await logoutUser();

        expect(mockFetchWithAuth).toHaveBeenCalledWith("/logout", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        expect(mockCookieDelete).toHaveBeenCalledTimes(2);
        expect(result).toEqual(testCase.expected);
      }
    });

    it("should handle concurrent logout requests", async () => {
      const mockResponse = { success: true };
      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const mockCookieDelete = jest.fn();
      mockCookies.mockResolvedValue({
        delete: mockCookieDelete,
      });

      const promises = [logoutUser(), logoutUser(), logoutUser()];

      const results = await Promise.all(promises);

      expect(mockFetchWithAuth).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toEqual({ success: true });
      });
    });

    it("should handle cookies() throwing an error", async () => {
      const mockResponse = { success: true };
      mockFetchWithAuth.mockResolvedValue(mockResponse);

      mockCookies.mockRejectedValue(new Error("Cookie error"));

      await expect(logoutUser()).rejects.toThrow("Cookie error");
    });

    it("should handle cookies() returning null", async () => {
      const mockResponse = { success: true };
      mockFetchWithAuth.mockResolvedValue(mockResponse);

      mockCookies.mockResolvedValue(null);

      await expect(logoutUser()).rejects.toThrow();
    });

    it("should handle cookies() returning undefined", async () => {
      const mockResponse = { success: true };
      mockFetchWithAuth.mockResolvedValue(mockResponse);

      mockCookies.mockResolvedValue(undefined);

      await expect(logoutUser()).rejects.toThrow();
    });
  });
});

