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
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface UserWithJWT {
  user: User;
  access_token: string;
  expire: number;
}
