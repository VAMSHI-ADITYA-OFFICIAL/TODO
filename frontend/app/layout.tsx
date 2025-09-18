import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";
import { Geist } from "next/font/google";
import { ToastProvider } from "@/app/components/ToastProvider";

import { ReactNode } from "react";
import { AuthProvider } from "./context/authContext";
const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "My Todo App",
  description: "A simple and accessible todo application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.className}>
      <body className="bg-white dark:bg-gray-900 m-2 p-2 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AuthProvider>
          <ToastProvider>
            <header className="flex">
              <div className="flex gap-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
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
              <ThemeToggle />
            </header>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
