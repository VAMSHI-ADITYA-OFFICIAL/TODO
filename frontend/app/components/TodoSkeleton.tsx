"use client";

export default function TodoSkeleton() {
  return (
    <li className="flex flex-col m-2 rounded dark:bg-gray-800 dark:border-1 p-2 border-black shadow-xl dark:shadow-blue-950 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-4 items-center">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        </div>
        <div className="hidden md:flex gap-1">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="md:hidden">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </li>
  );
}
