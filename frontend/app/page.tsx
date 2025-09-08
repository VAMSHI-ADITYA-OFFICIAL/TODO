"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      router.replace("/todos"); // go to todos if logged in
    } else {
      router.replace("/login"); // go to login if not logged in
    }
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <p>Checking authentication...</p>
    </main>
  );
}
