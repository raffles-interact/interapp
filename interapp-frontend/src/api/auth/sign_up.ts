import { AccountDetails } from '@/providers/AuthProvider/types';

export async function signUp(accountDetails: AccountDetails): Promise<void> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountDetails),
  });
  if (!response.ok) {
    console.error(response);
  }
}
