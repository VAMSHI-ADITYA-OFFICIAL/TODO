"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
export interface UserProps {
  name: string;
  id: string;
  role: string;
}
interface AuthContextType {
  setUserDetails: (token: UserProps | null) => void;
  userDetails: UserProps | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("userInfo");
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear user details from context
    setUserDetails(null);

    // Redirect to login page
    window.location.href = "/login";
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
