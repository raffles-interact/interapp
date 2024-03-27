import { APIClient } from './api_client';
import { UserWithProfilePicture } from '../providers/AuthProvider/types';

export function remapAssetUrl(url: string) {
  // get the website URL from the environment variables, remove trailing slashes
  const websiteURL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string).replace(/\/$/, '');
  const minioURL = new URL(url);
  const path = minioURL.pathname.split('/').slice(2).join('/');
  return `${websiteURL}/assets/${path}`;
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

interface ZodFieldErrors {
  fieldErrors: {
    [key: string]: Array<string>;
  };
}
export function parseErrorMessage(resBody: unknown) {
  // check if 'data' exists in the response body
  if (!resBody || typeof resBody !== 'object' || !('data' in resBody)) {
    return 'An unknown error occurred';
  }

  const { data: errors } = resBody;

  if (typeof errors === 'string') {
    return errors;
  }

  if (!errors || typeof errors !== 'object' || !('fieldErrors' in errors)) {
    return 'An unknown error occurred';
  }
  const errorMessages = Object.entries((errors as ZodFieldErrors).fieldErrors)
    .map(([field, messages]) => {
      return messages.map((message) => `${field}: ${message}`);
    })
    .flat();
  return errorMessages.join('\n');
}
