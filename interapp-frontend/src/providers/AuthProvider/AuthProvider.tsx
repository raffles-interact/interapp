import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  AuthProviderProps,
  LogInDetails,
  AccountDetails,
  User,
  AuthContextType,
  UserWithJWT,
  validateUserType,
} from './types';
import APIClient from '@api/api_client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { routePermissions, noLoginRequiredRoutes } from '@/app/route_permissions';
import { notifications } from '@mantine/notifications';
import { wildcardMatcher } from '@utils/.';

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
  const params = useSearchParams();
  const apiClient = useMemo(() => new APIClient().instance, []);

  const memoWildcardMatcher = useCallback(wildcardMatcher, []);

  const allowedRoutes = useMemo(() => {
    if (!user) return noLoginRequiredRoutes;

    return Object.entries(routePermissions).reduce((acc, [permission, routes]) => {
      if (user.permissions.includes(Number(permission))) {
        acc.push(...routes);
      }
      return acc;
    }, [] as string[]);
  }, [user]);

  useEffect(() => {
    if (loading) return; // we dont know if user is logged in or not yet
    if (justLoggedIn) {
      setJustLoggedIn(false);
      return;
    }

    const validUser = validateUserType(user);
    if (!validUser) {
      logout();
      throw new Error('Invalid user type in local storage\n' + JSON.stringify(user));
    }

    if (allowedRoutes.some((route) => memoWildcardMatcher(pathname, route))) {
      return;
    }
    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'You must be logged in to access this page',
        color: 'red',
      });
      // convert search params to an object and then to a query string
      const constructedSearchParams = Object.entries(Object.fromEntries(params))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      const fullPath = `${pathname}${constructedSearchParams ? `?${constructedSearchParams}` : ''}`;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(fullPath)}`);

      return;
    }
    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      notifications.show({
        title: 'Info',
        message: 'You are already logged in. Redirecting to home page.',
        color: 'red',
      });
      router.replace('/');
      return;
    }
    notifications.show({
      title: 'Error',
      message: 'You do not have permission to access this page',
      color: 'red',
    });
    router.replace('/');
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

    if (status === 200) {
      localStorage.setItem('access_token_expire', expire.toString());
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setJustLoggedIn(true);
      router.refresh(); // invalidate browser cache
    }

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
