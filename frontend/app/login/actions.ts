"use server";
export async function loginUser(data: { email: string; password: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return { error: error?.message || "Signup failed" };
  }
  const result = await response.json();

  return { result };
}
