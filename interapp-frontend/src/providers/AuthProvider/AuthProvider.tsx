import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthProviderProps, LogInDetails, AccountDetails, User, AuthContextType } from './types';
import axiosClient from '@api/api_client';
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // we dont know if user is logged in or not yet

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
      return router.replace('/');
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
    return router.replace('/');
  }, [user, loading]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (user && accessToken) {
      setUser(JSON.parse(user));
    }
    const expired = Number(localStorage.getItem('accessTokenExpire')) < Date.now();

    if (expired && accessToken) {
      axiosClient
        .refreshAccessToken()
        .then((res) => {
          localStorage.setItem('accessToken', res.accessToken);
        })
        .catch(logout);
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (details: LogInDetails) => {
    const { data, status } = await axiosClient.signIn(details);
    const { accessToken, expire, user } = data;

    if (status !== 200) return status;

    localStorage.setItem('accessTokenExpire', expire.toString());
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    router.refresh(); // invalidate browser cache
    return status;
  }, []);

  const logout = useCallback(async () => {
    const status = await axiosClient.signOut();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExpire');
    router.refresh(); // invalidate browser cache
    return status;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const registerUserAccount = useCallback(async (accountDetails: AccountDetails) => {
    const status = await axiosClient.signUp(accountDetails);
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
