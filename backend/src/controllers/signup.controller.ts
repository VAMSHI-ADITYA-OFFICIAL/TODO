import type { Request, Response } from "express";
import { User } from "../models/signup.model.ts";

export async function SignupHandler(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const userCreated = await User.create({ name, email, password, role });
  if (!userCreated) {
    return res.status(400).send("User not created");
  }
  return res.status(201).send({ message: "User created" });
}
