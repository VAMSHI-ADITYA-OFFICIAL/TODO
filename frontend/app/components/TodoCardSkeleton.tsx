// components/TodoCardSkeleton.tsx
import React from "react";

export default function TodoCardSkeleton() {
  return (
    <div className="flex justify-between items-center border rounded-lg p-4 shadow-sm animate-pulse bg-white dark:bg-gray-800 w-full mb-4">
      {/* Left content */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-4 items-center">
          {/* Title placeholder */}
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
          {/* Date placeholder */}
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 opacity-70"></div>
        </div>
        {/* Description placeholder */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full max-w-md"></div>
      </div>

      {/* Action buttons - mobile */}
      <div className="md:hidden flex ml-auto gap-2">
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Action buttons - desktop */}
      <div className="hidden md:flex gap-1">
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
