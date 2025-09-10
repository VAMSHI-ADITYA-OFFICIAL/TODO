import type { Request, Response } from "express";
import { User } from "../models/signup.model.ts";
import { comparePassword, hashPassword } from "../utils/hashpassword.ts";

export async function loginHandler(req: Request, res: Response) {
  const findUser = await User.findOne({ email: req.body.email });

  const comparePass = await comparePassword(
    req.body.password,
    findUser.password
  );

  if (!comparePass) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  res.status(200).json({ name: findUser.name });
}

export async function updateUserHandler(req: Request, res: Response) {
  const findUser = await User.findOne({ _id: req.params._id });
  if (!findUser) {
    return res.status(400).json({ error: "User not found" });
  }
  const updatedPassword = await hashPassword(req.body.password);
  await User.updateMany(
    { email: req.body.email },
    { name: req.body.name, password: updatedPassword }
  );
  res.status(200).json({ message: "User updated successfully" });
}
