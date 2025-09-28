import { loginHandler } from "../../controllers/login.controller.js";
import { User } from "../../models/signup.model.js";
import { RefreshToken } from "../../models/refresh.model.js";
import {
  createMockRequest,
  createMockResponse,
  createTestUser,
  clearDatabase,
} from "../utils/testHelpers.js";
import { hashPassword } from "../../utils/hashpassword.js";

describe("Login Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(async () => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    await clearDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it("should login user successfully", async () => {
    // Create a test user
    const testUser = await createTestUser();

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

    // Verify refresh token was stored in database
    const refreshToken = await RefreshToken.findOne({ userId: testUser._id });
    expect(refreshToken).toBeTruthy();
  });

  it("should return 400 if user not found", async () => {
    mockReq.body = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    await loginHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  it("should return 400 for invalid credentials", async () => {
    const testUser = await createTestUser();

    mockReq.body = {
      email: testUser.email,
      password: "wrongpassword",
    };

    await loginHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid credentials",
    });
  });

  it("should store device information in refresh token", async () => {
    const testUser = await createTestUser();

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
});
