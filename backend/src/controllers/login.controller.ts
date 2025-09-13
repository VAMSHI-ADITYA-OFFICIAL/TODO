import type { Request, Response } from "express";
import { User } from "../models/signup.model.js";
import { comparePassword, hashPassword } from "../utils/hashpassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

export async function loginHandler(req: Request, res: Response) {
  const findUser: any = await User.findOne({ email: req.body.email });

  if (!findUser) {
    return res.status(400).json({ error: "User not found" });
  }

  const comparePass = await comparePassword(
    req.body.password,
    findUser.password
  );

  if (!comparePass) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const refreshToken = await generateRefreshToken(findUser);
  const accessToken = await generateAccessToken(findUser);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: true,
  });

  res.status(200).json({
    accessToken,
    result: { name: findUser.name, id: findUser._id, role: findUser.role },
    message: "Login successful",
    status: "success",
  });
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
