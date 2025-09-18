import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center m-52 h-screen">
      <h1 className="text-2xl">
        Welcome to the SImple Todo Application, Just plain old todo application
      </h1>
      <div className="flex gap-2">
        <Link
          className="bg-blue-700 hover:bg-blue-800 p-2 focus:ring-blue-300 cursor-pointer px-4 rounded focus:outline-none focus:ring-2 text-white"
          href={"/signup"}
        >
          Signup
        </Link>
        <Link
          className="bg-green-700 hover:bg-green-800 p-2 focus:ring-blue-300 cursor-pointer px-4 rounded focus:outline-none focus:ring-2 text-white"
          href={"/login"}
        >
          Login
        </Link>
      </div>
    </main>
  );
}
