"use client";

import { useAuth, UserProps } from "../context/authContext";
import ThemeToggle from "./ThemeToggle";
import UserDetails from "./UserDetails";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setUserDetails(JSON.parse(stored));
    }
  }, []);

  return (
    <header className="flex justify-between">
      <div className="flex gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="mr-2"
        >
          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
          <path
            d="M8 12l2 2 4-4"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          TODO
        </span>
      </div>
      <div className="flex items-center gap-2">
        {pathname.includes("/todos") && (
          <UserDetails userDetails={userDetails} />
        )}
        {/* Desktop view - show individual buttons */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {pathname.includes("/todos") && (
            <Button
              onClick={logout}
              variant="danger"
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-red-600 transition-colors duration-200 rounded-md shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
        {/* Mobile view - show popover menu */}
        <MobileMenu userDetails={userDetails} />
      </div>
    </header>
  );
}
