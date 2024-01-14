import { APIClient } from './api_client';
import { UserWithProfilePicture } from '../providers/AuthProvider/types';

export function remapAssetUrl(url: string) {
  const minioURL = new URL(url);
  const path = minioURL.pathname.split('/').slice(2).join('/');
  return `http://localhost:3000/assets/${path}`;
}

export async function getAllUsernames() {
  const apiClient = new APIClient().instance;

  const get_all_users = await apiClient.get('/user');
  const all_users: Omit<UserWithProfilePicture, 'permissions'>[] = get_all_users.data;
  const allUsersNames = all_users !== undefined ? all_users.map((user) => user.username) : [];
  return allUsersNames;
}

export function wildcardMatcher(str: string, pattern: string) {
  // Add a trailing slash to the pattern if it doesn't have one
  if (!pattern.endsWith('/')) {
    pattern += '/';
  }
  // Add a trailing slash to the string if it doesn't have one
  if (!str.endsWith('/')) {
    str += '/';
  }
  // Replace '*' with '.*' to create a regex pattern
  const regexPattern = `^${pattern.replace(/\*/g, '.*')}$`;
  // Create a new RegExp object
  const regex = new RegExp(regexPattern);
  // Test the url against the regex pattern
  return regex.test(str);
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
