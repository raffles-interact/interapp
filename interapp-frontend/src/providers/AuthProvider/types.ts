import { ReactNode } from 'react';
import { Permissions } from '@/app/route_permissions';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginDetails: LogInDetails) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  registerUserAccount: (accountDetails: AccountDetails) => Promise<void>;
}

export interface LogInDetails {
  username: string;
  password: string;
}

export interface AccountDetails extends LogInDetails {
  email: string;
  userId: number;
}

export interface User {
  username: string;
  userId: number;
  email: string;
  permissions: Permissions[];
  verified: boolean;
  serviceHours: number;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface UserWithJWT {
  user: User;
  accessToken: string;
  expire: number;
}
