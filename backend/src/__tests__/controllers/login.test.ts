/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
} from "../../controllers/login.controller.js";
import { User } from "../../models/signup.model.js";
import { RefreshToken } from "../../models/refresh.model.js";
import {
  createMockRequest,
  createMockResponse,
  createTestUser,
  generateTestTokens,
} from "../utils/testHelpers.js";

describe("Login Controller", () => {
  let mockReq: any;
  let mockRes: any;
  let testUser: any;

  beforeEach(async () => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe("loginHandler", () => {
    it("should login user with valid credentials", async () => {
      mockReq.body = {
        email: testUser.email,
        password: "TestPassword123!",
      };

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          message: "Login successful",
          status: "success",
        })
      );
    });

    it("should return error for non-existent user", async () => {
      mockReq.body = {
        email: "nonexistent@example.com",
        password: "TestPassword123!",
      };

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return error for invalid password", async () => {
      mockReq.body = {
        email: testUser.email,
        password: "WrongPassword",
      };

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("should create refresh token in database", async () => {
      mockReq.body = {
        email: testUser.email,
        password: "TestPassword123!",
      };

      await loginHandler(mockReq, mockRes);

      const refreshTokens = await RefreshToken.find({ userId: testUser._id });
      expect(refreshTokens).toHaveLength(1);
      expect(refreshTokens[0].token).toBeDefined();
      expect(refreshTokens[0].userId.toString()).toBe(testUser._id);
    });

    it("should capture device information", async () => {
      mockReq.body = {
        email: testUser.email,
        password: "TestPassword123!",
        deviceName: "Test Device",
      };
      mockReq.headers = {
        "user-agent": "Test Browser/1.0",
      };
      mockReq.ip = "192.168.1.1";

      await loginHandler(mockReq, mockRes);

      const refreshToken = await RefreshToken.findOne({ userId: testUser._id });
      expect(refreshToken?.device?.userAgent).toBe("Test Browser/1.0");
      expect(refreshToken?.device?.name).toBe("Test Device");
      expect(refreshToken?.device?.ip).toBe("192.168.1.1");
    });

    describe("refreshTokenHandler", () => {
      let refreshToken: string;

      beforeEach(async () => {
        const tokens = generateTestTokens(testUser);
        refreshToken = tokens.refreshToken;

        await RefreshToken.create({
          token: refreshToken,
          userId: testUser._id,
          device: {
            userAgent: "Test Browser",
            ip: "127.0.0.1",
            name: "Test Device",
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      });

      it("should refresh tokens successfully", async () => {
        mockReq.body = { refreshToken };

        await refreshTokenHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });

      it("should return error for missing refresh token", async () => {
        mockReq.body = {};

        await refreshTokenHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "No refresh token",
        });
      });

      it("should return error for invalid refresh token", async () => {
        mockReq.body = { refreshToken: "invalid-token" };

        await refreshTokenHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Invalid refresh token",
        });
      });

      it("should return error for expired refresh token", async () => {
        // Create an expired token
        const expiredToken = "expired-token";
        await RefreshToken.create({
          token: expiredToken,
          userId: testUser._id,
          device: {
            userAgent: "Test Browser",
            ip: "127.0.0.1",
            name: "Test Device",
          },
          expiresAt: new Date(Date.now() - 1000), // Expired
        });

        mockReq.body = { refreshToken: expiredToken };

        await refreshTokenHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Token expired or invalid",
        });
      });

      it("should rotate refresh token in database", async () => {
        mockReq.body = { refreshToken };

        await refreshTokenHandler(mockReq, mockRes);

        // Check that the response was successful
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          })
        );

        // Check that tokens exist for the user
        const tokens = await RefreshToken.find({ userId: testUser._id });
        expect(tokens.length).toBeGreaterThan(0);
      });
    });

    describe("logoutHandler", () => {
      beforeEach(async () => {
        // Create a refresh token for the user
        await RefreshToken.create({
          token: "test-refresh-token",
          userId: testUser._id,
          device: {
            userAgent: "Test Browser",
            ip: "127.0.0.1",
            name: "Test Device",
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      });

      it("should logout user successfully", async () => {
        mockReq.userId = testUser._id;
        mockReq.headers = { "user-agent": "Test Browser" };

        await logoutHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Logout successful",
        });

        // Verify refresh token was deleted
        const refreshTokens = await RefreshToken.find({ userId: testUser._id });
        expect(refreshTokens).toHaveLength(0);
      });

      it("should return error for missing user ID", async () => {
        mockReq.userId = null;

        await logoutHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "User not found",
        });
      });

      it("should return error for no active session", async () => {
        mockReq.userId = testUser._id;
        mockReq.headers = { "user-agent": "Different Browser" };

        await logoutHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "No active session found for this device",
        });
      });

      it("should handle database errors gracefully", async () => {
        // Mock database error
        const originalDeleteMany = RefreshToken.deleteMany;
        RefreshToken.deleteMany = jest
          .fn()
          .mockRejectedValue(new Error("Database error"));

        mockReq.userId = testUser._id;
        mockReq.headers = { "user-agent": "Test Browser" };

        await logoutHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Internal server error",
        });

        // Restore original method
        RefreshToken.deleteMany = originalDeleteMany;
      });
    });
  });
});
