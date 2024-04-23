import { ReactNode } from 'react';
import { Permissions } from '@/app/route_permissions';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginDetails: LogInDetails) => Promise<number>;
  logout: () => Promise<number>;
  updateUser: (updatedUser: User) => void; // update user in context
  registerUserAccount: (accountDetails: AccountDetails) => Promise<number>;
}

export interface LogInDetails {
  username: string;
  password: string;
}

export interface AccountDetails extends LogInDetails {
  email: string;
  user_id: number;
}

export interface User {
  username: string;
  user_id: number;
  email: string;
  permissions: Permissions[];
  verified: boolean;
  service_hours: number;
  profile_picture: string | null;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface UserWithJWT {
  user: User;
  access_token: string;
  expire: number;
}

export function validateUserType(user: User | null): boolean {
  if (user === null) return true;

  const conditions = [
    user.username !== undefined && typeof user.username === 'string',
    user.user_id !== undefined && typeof user.user_id === 'number',
    user.email !== undefined && typeof user.email === 'string',
    user.permissions !== undefined &&
      Array.isArray(user.permissions) &&
      user.permissions.length > 0 &&
      user.permissions.every((permission) => Object.values(Permissions).includes(permission)),
    user.verified !== undefined && typeof user.verified === 'boolean',
    user.service_hours !== undefined && typeof user.service_hours === 'number',
    user.profile_picture !== undefined &&
      (user.profile_picture === null || typeof user.profile_picture === 'string'),
  ];

  if (conditions.every((condition) => condition)) return true;
  return false;
}
