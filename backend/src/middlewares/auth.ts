import { Request, Response, NextFunction } from "express";
import { readAccessToken } from "../utils/generateTokens.js";
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const AuthHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = readAccessToken(token) as { id: string };
    req.userId = decoded.id; // ✅ attach to request
    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
