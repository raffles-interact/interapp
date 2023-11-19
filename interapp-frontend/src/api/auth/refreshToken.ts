import { LogInDetails, UserWithJWT } from '@/providers/AuthProvider/types';

export async function refreshAccessToken(): Promise<string> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    console.error(response);
  }
  const raw: { jwt: string } = await response.json();
  return raw.jwt;
}
