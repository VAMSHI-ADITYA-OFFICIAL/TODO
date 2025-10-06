// components/ToastProvider.tsx
"use client";
import React, { ReactNode, useState, useEffect } from "react";
import { toastService } from "../services/toastServices";

type Toast = {
  message: string;
  type: "success" | "error" | "info";
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToasts((prev) => [...prev, { message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.message !== message));
    }, 3000);
  };

  // Register callback in ToastService
  useEffect(() => {
    toastService.register(showToast);
  }, []);

  return (
    <>
      {children}
      <div
        data-testid="tooltips"
        className="fixed bottom-4 right-4 flex flex-col gap-2"
      >
        {toasts.map((t, index) => (
          <div
            key={index}
            className={`p-2 rounded text-white ${
              t.type === "success"
                ? "bg-green-500"
                : t.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
