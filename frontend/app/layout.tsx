"use client";
import "./globals.css";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  console.log({ theme });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 px-3 py-2 bg-gray-200 dark:bg-gray-800 rounded"
        >
          Toggle {theme === "light" ? "Dark" : "Light"}
        </button>
        {children}
      </body>
    </html>
  );
}
