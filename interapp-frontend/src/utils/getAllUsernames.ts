import { APIClient } from '@api/api_client';
import { User } from '@providers/AuthProvider/types';
import { ClientError } from './parseClientError';

export async function getAllUsernames() {
  const apiClient = new APIClient().instance;

  const get_all_users = await apiClient.get('/user');
  if (get_all_users.status !== 200)
    throw new ClientError({
      message: 'Failed to get all users',
      responseStatus: get_all_users.status,
      responseBody: get_all_users.data,
    });

  const all_users: Omit<User, 'permissions'>[] = get_all_users.data;
  const allUsersNames = all_users !== undefined ? all_users.map((user) => user.username) : [];
  return allUsersNames;
}
