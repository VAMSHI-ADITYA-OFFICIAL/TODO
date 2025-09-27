"use server";

export async function signupUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = data;
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return error;
  }
  const result = await response.json();

  return { result };
}
