import request from "supertest";
import express from "express";
import loginRouter from "../../routes/login.route.js";
import { User } from "../../models/signup.model.js";
import { clearDatabase, createTestUser } from "../utils/testHelpers.js";
import { hashPassword } from "../../utils/hashpassword.js";

const app = express();
app.use(express.json());
app.use("/login", loginRouter);

describe("Login Route", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe("POST /login", () => {
    it("should login user successfully", async () => {
      const testUser = await createTestUser();

      const res = await request(app).post("/login").send({
        email: testUser.email,
        password: "TestPassword123!",
      });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        result: {
          name: testUser.name,
          id: testUser._id,
          role: testUser.role,
        },
        message: "Login successful",
        status: "success",
      });
    });

    it("should return 400 for user not found", async () => {
      const res = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "User not found",
      });
    });

    it("should return 400 for invalid credentials", async () => {
      const testUser = await createTestUser();

      const res = await request(app).post("/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid credentials",
      });
    });

    it("should handle device information", async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .post("/login")
        .send({
          email: testUser.email,
          password: "TestPassword123!",
          deviceName: "Test Device",
        })
        .set("User-Agent", "Test Browser/1.0");

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });

  describe("PUT /login/:_id", () => {
    it("should update user successfully", async () => {
      const testUser = await createTestUser();

      const res = await request(app).put(`/login/${testUser._id}`).send({
        email: testUser.email,
        name: "Updated Name",
        password: "NewPassword123!",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "User updated successfully",
      });

      // Verify user was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.name).toBe("Updated Name");
    });

    it("should return 500 for non-existent user", async () => {
      const res = await request(app).put("/login/nonexistent-id").send({
        email: "test@example.com",
        name: "Updated Name",
        password: "NewPassword123!",
      });

      expect(res.status).toBe(500);
      // The response body might be empty for 500 errors
      expect(res.body).toBeDefined();
    });
  });
});
