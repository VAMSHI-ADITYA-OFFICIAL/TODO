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
import { usePathname } from "next/navigation";

export default function MobileMenu({
  userDetails,
}: {
  userDetails: UserProps | null;
}) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const showLogoutButton = pathname.includes("/todos");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="plane"
          className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md shadow-sm"
        >
          <Menu className="w-4 h-4" />
          Menu
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        align="end"
      >
        <div className="flex flex-col gap-4 ">
          {showLogoutButton && (
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-600 ">
              <CircleUser />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {userDetails?.name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <ThemeToggle />
          </div>
          {showLogoutButton && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <Button
                onClick={logout}
                variant="danger"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white hover:bg-red-600 transition-colors duration-200 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
