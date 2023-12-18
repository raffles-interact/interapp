import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  AuthProviderProps,
  LogInDetails,
  AccountDetails,
  User,
  AuthContextType,
  UserWithJWT,
} from './types';
import APIClient from '@api/api_client';
import { useRouter, usePathname } from 'next/navigation';
import { RoutePermissions, noLoginRequiredRoutes } from '@/app/route_permissions';
import { notifications } from '@mantine/notifications';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => 0,
  logout: async () => 0,
  updateUser: () => {},
  registerUserAccount: async () => 0,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false); // used to prevent redirecting to home page after login
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const apiClient = useMemo(() => new APIClient().instance, []);

  useEffect(() => {
    if (loading) return; // we dont know if user is logged in or not yet
    if (justLoggedIn) {
      setJustLoggedIn(false);
      return;
    }

    if (!user) {
      if (!noLoginRequiredRoutes.includes(pathname)) {
        notifications.show({
          title: 'Error',
          message: 'You must be logged in to access this page',
          color: 'red',
        });
        router.replace('/auth/login');
      }
      return;
    } else if (pathname === '/auth/login' || pathname === '/auth/signup') {
      notifications.show({
        title: 'Error',
        message: 'You are already logged in. Redirecting to home page.',
        color: 'red',
      });
      router.replace('/');
      return;
    }

    const userPermissions = user.permissions;

    for (const permission of userPermissions) {
      if (RoutePermissions[permission].includes(pathname)) {
        return;
      }
    }
    notifications.show({
      title: 'Error',
      message: 'You do not have permission to access this page',
      color: 'red',
    });
    router.replace('/');
    return;
  }, [user, loading]);

  useEffect(() => {
    const access_token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (user && access_token) {
      setUser(JSON.parse(user));
    }
    const expired = Number(localStorage.getItem('access_token_expire')) < Date.now();

    if (expired && access_token) {
      apiClient
        .post('/auth/refresh')
        .then((res) => {
          if (res.status !== 200) {
            logout();
            return;
          }
          localStorage.setItem(
            'access_token',
            (res.data as Omit<UserWithJWT, 'user'>).access_token,
          );
        })
        .catch(logout);
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (details: LogInDetails) => {
    const { data, status }: { data: UserWithJWT; status: number } = await apiClient.post(
      '/auth/signin',
      JSON.stringify({ ...details }),
    );
    const { access_token, expire, user } = data;

    if (status !== 200) return status;

    localStorage.setItem('access_token_expire', expire.toString());
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setJustLoggedIn(true);
    router.refresh(); // invalidate browser cache
    return status;
  }, []);

  const logout = useCallback(async () => {
    const status = (await apiClient.delete('/auth/signout')).status;
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expire');
    router.refresh(); // invalidate browser cache
    return status;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const registerUserAccount = useCallback(async (accountDetails: AccountDetails) => {
    const status = (await apiClient.post('/auth/signup', JSON.stringify(accountDetails))).status;
    return status;
  }, []);

  const providerValue = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      updateUser,
      registerUserAccount,
    }),
    [user, loading, login, logout, updateUser, registerUserAccount],
  );
  return <AuthContext.Provider value={providerValue}>{children}</AuthContext.Provider>;
};
