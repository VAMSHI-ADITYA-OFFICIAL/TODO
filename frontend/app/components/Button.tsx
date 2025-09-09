import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}
export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-300",
    secondary: "bg-gray-500 hover:bg-gray-700 text-white",
    danger: "bg-red-500 hover:bg-red-700 text-white",
  };

  return (
    <button
      className={`px-4 py-2 rounded ${variantClasses[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
