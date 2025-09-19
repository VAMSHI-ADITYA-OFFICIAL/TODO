// lib/utils/token.ts
import { jwtVerify } from "jose";

// Use the same secret key as your backend's jsonwebtoken setup.
// For example, if your backend uses:
// jsonwebtoken.sign(payload, process.env.JWT_SECRET)
// Your Next.js app will use:
const SECRET_KEY = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function isTokenExpired(token: string): Promise<boolean> {
  if (!token) {
    return true;
  }

  try {
    await jwtVerify(token, SECRET_KEY, {
      // Ensure the algorithm matches the one used by your backend
      algorithms: ["HS256"],
    });

    // The jose.jwtVerify function automatically checks the expiration date
    // and throws an error if the token has expired.
    return false;
  } catch (error) {
    // An error here means the token is invalid, expired, or tampered with.
    return true;
  }
}
