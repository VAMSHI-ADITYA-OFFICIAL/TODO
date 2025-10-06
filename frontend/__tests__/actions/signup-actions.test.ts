import { signupUser } from "../../app/signup/actions";

// Mock fetch globally
global.fetch = jest.fn();

describe("Signup Actions", () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  describe("signupUser", () => {
    const validUserData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    };

    it("should successfully signup a user with valid data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
          user: { id: "1", name: "John Doe", email: "john@example.com" },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUserData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        result: {
          message: "User created successfully",
          user: { id: "1", name: "John Doe", email: "john@example.com" },
        },
      });
    });

    it("should handle signup with different user data", async () => {
      const differentUserData = {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "securepassword456",
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
          user: { id: "2", name: "Jane Smith", email: "jane@example.com" },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(differentUserData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(differentUserData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        result: {
          message: "User created successfully",
          user: { id: "2", name: "Jane Smith", email: "jane@example.com" },
        },
      });
    });

    it("should handle server error response", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Email already exists",
          status: 400,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await signupUser(validUserData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUserData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        error: "Email already exists",
        status: 400,
      });
    });

    it("should handle validation error from server", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Invalid email format",
          status: 422,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({
        error: "Invalid email format",
        status: 422,
      });
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(signupUser(validUserData)).rejects.toThrow("Network error");
    });

    it("should handle fetch timeout", async () => {
      mockFetch.mockRejectedValue(new Error("Request timeout"));

      await expect(signupUser(validUserData)).rejects.toThrow("Request timeout");
    });

    it("should handle server error with different status codes", async () => {
      const testCases = [
        { status: 500, error: "Internal server error" },
        { status: 409, error: "User already exists" },
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

        const result = await signupUser(validUserData);

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

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({ result: {} });
    });

    it("should handle response with null data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(null),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({ result: null });
    });

    it("should handle response with undefined data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(undefined),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({ result: undefined });
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(signupUser(validUserData)).rejects.toThrow("Invalid JSON");
    });

    it("should handle error response with malformed JSON", async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      await expect(signupUser(validUserData)).rejects.toThrow("Invalid JSON");
    });

    it("should handle user data with special characters", async () => {
      const specialCharData = {
        name: "José María",
        email: "josé.maría@example.com",
        password: "p@ssw0rd!@#$%",
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
          user: { id: "3", name: "José María", email: "josé.maría@example.com" },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(specialCharData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(specialCharData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        result: {
          message: "User created successfully",
          user: { id: "3", name: "José María", email: "josé.maría@example.com" },
        },
      });
    });

    it("should handle user data with very long strings", async () => {
      const longStringData = {
        name: "A".repeat(1000),
        email: "verylongemail@example.com",
        password: "B".repeat(1000),
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(longStringData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(longStringData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        result: {
          message: "User created successfully",
        },
      });
    });

    it("should handle user data with empty strings", async () => {
      const emptyStringData = {
        name: "",
        email: "",
        password: "",
      };

      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "All fields are required",
          status: 400,
        }),
      };

      mockFetch.mockResolvedValue(mockErrorResponse as any);

      const result = await signupUser(emptyStringData);

      expect(result).toEqual({
        error: "All fields are required",
        status: 400,
      });
    });

    it("should handle user data with whitespace only", async () => {
      const whitespaceData = {
        name: "   ",
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

      const result = await signupUser(whitespaceData);

      expect(result).toEqual({
        error: "Invalid input data",
        status: 400,
      });
    });

    it("should handle concurrent signup requests", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const promises = [
        signupUser({ ...validUserData, email: "user1@example.com" }),
        signupUser({ ...validUserData, email: "user2@example.com" }),
        signupUser({ ...validUserData, email: "user3@example.com" }),
      ];

      const results = await Promise.all(promises);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toEqual({
          result: {
            message: "User created successfully",
          },
        });
      });
    });

    it("should handle environment variable not set", async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(mockFetch).toHaveBeenCalledWith(
        "undefined/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUserData),
          credentials: "include",
        }
      );

      expect(result).toEqual({
        result: {
          message: "User created successfully",
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
            message: "User created successfully",
          }),
        };

        mockFetch.mockResolvedValue(mockResponse as any);

        const result = await signupUser(validUserData);

        expect(mockFetch).toHaveBeenCalledWith(
          `${url}/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validUserData),
            credentials: "include",
          }
        );

        expect(result).toEqual({
          result: {
            message: "User created successfully",
          },
        });
      }
    });

    it("should handle response with nested user data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: "User created successfully",
          user: {
            id: "123",
            name: "John Doe",
            email: "john@example.com",
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

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({
        result: {
          message: "User created successfully",
          user: {
            id: "123",
            name: "John Doe",
            email: "john@example.com",
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
          message: "User created successfully",
          permissions: ["read", "write", "admin"],
          tags: ["new-user", "verified"],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await signupUser(validUserData);

      expect(result).toEqual({
        result: {
          message: "User created successfully",
          permissions: ["read", "write", "admin"],
          tags: ["new-user", "verified"],
        },
      });
    });
  });
});

