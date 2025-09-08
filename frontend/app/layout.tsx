import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Todo App",
  description: "Next.js Todo app with login",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
