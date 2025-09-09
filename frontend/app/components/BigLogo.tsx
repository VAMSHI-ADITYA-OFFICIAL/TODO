export default function Logo() {
  return (
    <div className="flex sm:justify-center items-center space-x-2">
      <svg
        className="w-10 h-10 sm:w-16 sm:h-16 md:w-[6.5rem] md:h-[6.5rem] flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
        <path
          d="M8 12l2 2 4-4"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-2xl sm:text-6xl md:text-9xl font-bold text-blue-600 dark:text-blue-400">
        TODO
      </span>
    </div>
  );
}
