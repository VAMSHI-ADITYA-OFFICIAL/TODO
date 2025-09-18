"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
interface UserProps {
  name: string;
  id: string;
  role: string;
}
interface AuthContextType {
  setUserDetails: (token: UserProps | null) => void;
  userDetails: UserProps | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);
  // console.log({ userDetails });
  return (
    <AuthContext.Provider value={{ setUserDetails, userDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
