import { fetchWithAuth } from "../../lib/auth";

// Mock Next.js cookies
const mockCookies = jest.fn();
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

describe("fetchWithAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      NODE_ENV: "development",
    };

    // Reset mock implementations
    mockCookies.mockResolvedValue(mockCookieStore);
    mockCookieStore.get.mockReturnValue(undefined);
    mockCookieStore.set.mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("successful requests", () => {
    it("should make request with access token", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchWithAuth("/api/test");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
        headers: {
          Authorization: "Bearer test-access-token",
        },
        credentials: "include",
      });
      expect(result).toEqual({ data: "test" });
    });

    it("should handle full URL without modification", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await fetchWithAuth("https://api.example.com/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        })
      );
    });

    it("should handle request without access token", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchWithAuth("/api/test");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
        headers: {
          Authorization: "",
        },
        credentials: "include",
      });
      expect(result).toEqual({ data: "test" });
    });

    it("should merge custom headers with authorization", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await fetchWithAuth("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Custom-Header": "custom-value",
        },
        body: JSON.stringify({ test: "data" }),
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Custom-Header": "custom-value",
          Authorization: "Bearer test-access-token",
        },
        body: JSON.stringify({ test: "data" }),
        credentials: "include",
      });
    });
  });

  describe("error handling", () => {
    it("should handle non-JSON error responses", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const errorResponse = {
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue("text/plain"),
        },
        text: jest.fn().mockResolvedValue("Internal Server Error"),
      };

      mockFetch.mockResolvedValue(errorResponse);

      await expect(fetchWithAuth("/api/test")).rejects.toThrow(
        "Request failed 500: Internal Server Error"
      );
    });

    it("should handle JSON error responses", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const errorResponse = {
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ error: "Bad Request" }),
      };

      mockFetch.mockResolvedValue(errorResponse);

      await expect(fetchWithAuth("/api/test")).rejects.toThrow(
        'Request failed 400: {"error":"Bad Request"}'
      );
    });

    it("should handle non-JSON success responses", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const successResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("text/plain"),
        },
        text: jest.fn().mockResolvedValue("Success message"),
      };

      mockFetch.mockResolvedValue(successResponse);

      await expect(fetchWithAuth("/api/test")).rejects.toThrow(
        "Expected JSON but received: Success message"
      );
    });
  });

  describe("environment configuration", () => {
    it("should use production settings in production", async () => {
      process.env.NODE_ENV = "production";

      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await fetchWithAuth("/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        })
      );
    });

    it("should handle missing NEXT_PUBLIC_BASE_URL", async () => {
      process.env.NEXT_PUBLIC_BASE_URL = undefined;

      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await fetchWithAuth("/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "undefined/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        })
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty response body", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({}),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchWithAuth("/api/test");
      expect(result).toEqual({});
    });

    it("should handle very long error messages", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const longError = "A".repeat(1000);
      const errorResponse = {
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue("text/plain"),
        },
        text: jest.fn().mockResolvedValue(longError),
      };

      mockFetch.mockResolvedValue(errorResponse);

      await expect(fetchWithAuth("/api/test")).rejects.toThrow(
        `Request failed 500: ${longError.slice(0, 500)}`
      );
    });

    it("should handle special characters in URLs", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-access-token" });

      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await fetchWithAuth("/api/test?param=value&special=@#$%");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test?param=value&special=@#$%",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        })
      );
    });
  });
});
