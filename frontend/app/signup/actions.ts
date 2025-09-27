export async function signupUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    return error;
  }
  const result = await response.json();

  return { result };
}
