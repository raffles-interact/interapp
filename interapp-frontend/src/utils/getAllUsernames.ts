import { APIClient } from '@api/api_client';
import { User } from '@providers/AuthProvider/types';

export async function getAllUsernames() {
  const apiClient = new APIClient().instance;

  const get_all_users = await apiClient.get('/user');
  const all_users: Omit<User, 'permissions'>[] = get_all_users.data;
  const allUsersNames = all_users !== undefined ? all_users.map((user) => user.username) : [];
  return allUsersNames;
}
