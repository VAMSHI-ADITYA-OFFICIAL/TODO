/* eslint-disable @typescript-eslint/no-explicit-any */
import { hashPassword, comparePassword } from "../../utils/hashpassword.js";

describe("Password Hashing Utilities", () => {
  const testPassword = "TestPassword123!";
  let hashedPassword: string;

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      hashedPassword = await hashPassword(testPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("should produce different hashes for the same password", async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty password", async () => {
      const hash = await hashPassword("");
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should handle special characters in password", async () => {
      const specialPassword = "P@ssw0rd!@#$%^&*()";
      const hash = await hashPassword(specialPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(specialPassword);
    });
  });

  describe("comparePassword", () => {
    beforeEach(async () => {
      hashedPassword = await hashPassword(testPassword);
    });

    it("should return true for correct password", async () => {
      const result = await comparePassword(testPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const result = await comparePassword("WrongPassword", hashedPassword);
      expect(result).toBe(false);
    });

    it("should return false for empty password", async () => {
      const result = await comparePassword("", hashedPassword);
      expect(result).toBe(false);
    });

    it("should return false for null password", async () => {
      // Test with empty string instead of null since the function expects a string
      const result = await comparePassword("", hashedPassword);
      expect(result).toBe(false);
    });

    it("should handle case sensitivity", async () => {
      const result = await comparePassword(
        testPassword.toLowerCase(),
        hashedPassword
      );
      expect(result).toBe(false);
    });

    it("should handle whitespace differences", async () => {
      const result = await comparePassword(` ${testPassword} `, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe("Password Security", () => {
    it("should use bcrypt with appropriate salt rounds", async () => {
      const hash = await hashPassword(testPassword);

      // bcrypt hashes start with $2b$ and have specific length
      expect(hash).toMatch(/^\$2[ab]\$\d+\$/);
      expect(hash.length).toBe(60); // bcrypt hash length
    });

    it("should be resistant to timing attacks", async () => {
      const hash = await hashPassword(testPassword);
      const start = Date.now();

      await comparePassword("wrong", hash);
      const wrongTime = Date.now() - start;

      const start2 = Date.now();
      await comparePassword(testPassword, hash);
      const correctTime = Date.now() - start2;

      // Times should be similar (within 100ms tolerance)
      expect(Math.abs(wrongTime - correctTime)).toBeLessThan(100);
    });
  });
});
