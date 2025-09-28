import type { Request, Response } from "express";
import { User } from "../models/signup.model.js";
import { comparePassword, hashPassword } from "../utils/hashpassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateTokens.js";
import type { UserProps } from "../utils/generateTokens.js";
import { RefreshToken } from "../models/refresh.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

interface FindUserProps extends UserProps {
  password: string;
}

export async function loginHandler(req: Request, res: Response) {
  const findUser: FindUserProps | null = await User.findOne({
    email: req.body.email,
  });

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

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Capture device info from request headers
  const deviceInfo = {
    userAgent: req.headers["user-agent"] || "Unknown",
    ip: req.ip || req.socket.remoteAddress,
    name: req.body.deviceName || "Unknown Device",
  };

  await RefreshToken.create({
    token: refreshToken,
    userId: findUser._id,
    device: deviceInfo,
    expiresAt,
  });

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: "none",
  //   path: "/",
  //   expires: expiresAt,
  // });

  res.status(200).json({
    accessToken,
    refreshToken,
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

export const refreshTokenHandler = async (req: Request, res: Response) => {
  // const refreshToken = req.cookies?.refreshToken;
  const refreshToken = req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    // 1️⃣ Check token in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 2️⃣ Verify JWT
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded === "string") {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    const user = decoded as UserProps;

    // 3️⃣ Create new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // console.log("newRefreshToken", newRefreshToken);

    // 4️⃣ Rotate refresh token in DB
    await RefreshToken.deleteMany({
      userId: user._id,
      "device.userAgent": req.headers["user-agent"],
    }); // remove old

    // console.log("old refresh cookie removed");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      device: storedToken.device, // preserve device info
      expiresAt,
    });

    // console.log("new created refresh cookie", res.header);

    res
      .status(201)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

export const logoutHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    const userAgent = req.headers["user-agent"] || "";

    const result = await RefreshToken.deleteMany({
      userId,
      "device.userAgent": userAgent,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No active session found for this device" });
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
