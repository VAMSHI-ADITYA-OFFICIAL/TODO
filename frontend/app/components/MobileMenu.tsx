"use client";

import { useAuth, UserProps } from "../context/authContext";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import { CircleUser, LogOut, Menu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { logoutUser } from "../login/actions";
import { useEffect, useState } from "react";

export default function MobileMenu() {
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setUserDetails(JSON.parse(stored));
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="plane"
          className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md shadow-sm"
        >
          <Menu className="w-4 h-4" />
          <div className="flex gap-2">
            <CircleUser />
            {userDetails?.name}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        align="end"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <Button
              onClick={() => {
                logout();
                logoutUser();
              }}
              variant="danger"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white hover:bg-red-600 transition-colors duration-200 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
