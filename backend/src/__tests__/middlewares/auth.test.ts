import { AuthHandler } from "../../middlewares/auth.js";
import {
  createMockRequest,
  createMockResponse,
  createTestUser,
  generateTestTokens,
} from "../utils/testHelpers.js";
import { clearDatabase } from "../utils/testHelpers.js";

describe("Auth Middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let testUser: any;

  beforeEach(async () => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
    await clearDatabase();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it("should allow access with valid token", () => {
    const { accessToken } = generateTestTokens(testUser);
    mockReq.headers = {
      authorization: `Bearer ${accessToken}`,
    };

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe(testUser._id);
  });

  it("should return 401 for missing authorization header", () => {
    mockReq.headers = {};

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Unauthorized",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token format", () => {
    mockReq.headers = {
      authorization: "InvalidFormat",
    };

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token", () => {
    mockReq.headers = {
      authorization: "Bearer invalid-token",
    };

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 for expired token", () => {
    // Create an expired token (this would need to be mocked in a real scenario)
    mockReq.headers = {
      authorization: "Bearer expired-token",
    };

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should handle malformed authorization header", () => {
    mockReq.headers = {
      authorization: "Bearer",
    };

    AuthHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
