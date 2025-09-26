import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "plane";
  fullWidth?: boolean;
}
export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: " bg-blue-700 hover:bg-blue-800 text-white",
    secondary: "bg-gray-500 hover:bg-gray-800 text-white",
    danger: "bg-red-500 hover:bg-red-700 ",
    plane: "",
  };

  return (
    <button
      className={`cursor-pointer px-4 rounded focus:outline-none focus:ring-2  focus:ring-blue-300 ${className} ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
