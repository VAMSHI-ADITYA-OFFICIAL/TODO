import jwt from "jsonwebtoken";

interface UserProps {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const generateRefreshToken = (user: UserProps) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const generateAccessToken = (user: UserProps) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const readAccessToken = (token: string) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};
