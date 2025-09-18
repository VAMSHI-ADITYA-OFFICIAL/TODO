import jwt from "jsonwebtoken";
export interface UserProps {
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
  return jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const generateAccessToken = (user: UserProps) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "2m" } //change it 15m later after testing
  );
};

export const readAccessToken = (token: string) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};
export const verifyRefreshToken = (token: string) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
