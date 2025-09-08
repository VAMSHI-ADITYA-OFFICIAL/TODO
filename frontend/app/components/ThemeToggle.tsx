"use client";

import { useEffect, useState } from "react";

import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.toggle("dark", prefersDark);

    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle("dark", newDark);

    setIsDark(newDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="ml-auto w-32 gap-2 h-10 rounded-full flex items-center justify-center bg-yellow-300 dark:bg-gray-800 transition-colors"
    >
      {isDark ? "Dark" : "Light"}
      {isDark ? (
        <Moon className="text-white w-5 h-5" />
      ) : (
        <Sun className="text-black w-5 h-5" />
      )}
    </button>
  );
}
