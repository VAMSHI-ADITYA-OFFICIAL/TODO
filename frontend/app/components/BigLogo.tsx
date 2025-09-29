import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src={"/apple-touch-icon.png"}
        alt="Todo Logo"
        width={100}
        height={100}
      />
      <span className="text-2xl sm:text-6xl md:text-9xl font-bold text-blue-600 dark:text-blue-400">
        TODO
      </span>
    </div>
  );
}
