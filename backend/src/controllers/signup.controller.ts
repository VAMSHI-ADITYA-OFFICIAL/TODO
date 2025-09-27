import type { Request, Response } from "express";
import { User } from "../models/signup.model.js";

export async function SignupHandler(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    console.log("Created user body:", req.body);
    const newUser = await User.create({ name, email, password, role });

    console.log("Created user:", newUser);

    return res.status(201).json({ message: "User created successfully" });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "ValidationError" &&
      "errors" in err
    ) {
      const errors: Record<string, string> = {};
      const validationErr = err as {
        errors: Record<string, { message: string }>;
      };
      for (const field in validationErr.errors) {
        errors[field] = validationErr.errors[field].message;
      }
      return res.status(400).json({ errors });
    }

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return res.status(400).json({ error: "Email already registered" });
    }

    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
