"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
export interface UserProps {
  name: string;
  id: string;
  role: string;
}
interface AuthContextType {
  setUserDetails: (_user: UserProps | null) => void;
  userDetails: UserProps | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("userInfo");

      // Clear cookies
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Clear user details from context
      setUserDetails(null);

      // Call server action to clear server-side cookies
      const { logoutUser } = await import("../login/actions");
      await logoutUser();

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if server action fails
      window.location.href = "/login";
    }
  };

  // console.log({ userDetails });
  return (
    <AuthContext.Provider value={{ setUserDetails, userDetails, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
