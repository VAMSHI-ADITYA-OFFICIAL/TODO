import "./globals.css";
import { Geist } from "next/font/google";
import { ToastProvider } from "@/app/components/ToastProvider";

import { ReactNode } from "react";
import { AuthProvider } from "./context/authContext";
import { ReactQueryProvider } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "./components/Header";
const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "My Todo App",
  description: "A simple and accessible todo application",
  icons: {
    icon: "../public/todo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.className}>
      <body className="bg-white dark:bg-gray-900 m-2 p-2 text-gray-900 dark:text-gray-100 transition-colors h-screen overflow-hidden duration-300">
        <AuthProvider>
          <ReactQueryProvider>
            <ToastProvider>
              <Header />
              {children}
              <SpeedInsights />
            </ToastProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
