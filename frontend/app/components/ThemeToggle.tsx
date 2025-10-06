"use client";

import { useEffect, useState } from "react";

import { Sun, Moon } from "lucide-react";
import Button from "./Button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      let shouldBeDark = false;

      if (storedTheme === "dark") {
        shouldBeDark = true;
      } else if (storedTheme === "light") {
        shouldBeDark = false;
      } else {
        // No stored theme, use system preference
        shouldBeDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
      }

      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle("dark", shouldBeDark);
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn("Failed to load theme from localStorage:", error);
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;

    try {
      localStorage.setItem("theme", newDark ? "dark" : "light");
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }

    try {
      document.documentElement.classList.toggle("dark", newDark);
    } catch (error) {
      console.warn("Failed to update document class:", error);
    }

    setIsDark(newDark);
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="plane"
      data-testid='theme-toggle"'
      className="ml-auto w-32 gap-2 h-10 rounded-full focus:ring-blue-300 flex items-center justify-center bg-yellow-300 dark:bg-gray-800 transition-colors"
    >
      {isDark ? "Dark" : "Light"}
      {isDark ? (
        <Moon className="text-white w-5 h-5" />
      ) : (
        <Sun className="text-black w-5 h-5" />
      )}
    </Button>
  );
}
