import { LogInDetails, UserWithJWT } from "@/providers/AuthProvider/types";

export async function signIn(det: LogInDetails): Promise<UserWithJWT> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(det),
  });
  if (!response.ok) {
    console.error(response);
  }
  return response.json();
}