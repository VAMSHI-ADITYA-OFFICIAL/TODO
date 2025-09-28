import type { Request, Response } from "express";
import { User } from "../models/signup.model.js";

export async function SignupHandler(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await User.create({ name, email, password, role });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // ✅ Log raw error always
    console.error("Signup error full:", err);

    if (err.name === "ValidationError") {
      const errors: Record<string, string> = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }

    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already registered" });
    }

    return res.status(500).json({ error: "Something went wrong" });
  }
}
