import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthProviderProps, LogInDetails, AccountDetails, User, AuthContextType } from './types';
import axiosClient from '@api/api_client';
import { useRouter, usePathname } from 'next/navigation';
import { RoutePermissions, noLoginRequiredRoutes, Permissions } from '@/app/route_permissions';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  registerUserAccount: async () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (!user) {
      if (!noLoginRequiredRoutes.includes(pathname)) {
        router.push('/auth/login');
      }
      return;
    }

    const currentUser: User = JSON.parse(user);
    const userPermissions = currentUser.permissions;

    for (const permission of userPermissions) {
      if (RoutePermissions[permission].includes(pathname)) {
        return;
      }
    }
    return router.push('/');
  }, []);

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
    const { accessToken, user, expire } = await axiosClient.signIn(details);

    localStorage.setItem('accessTokenExpire', expire.toString());
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await axiosClient.signOut();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExpire');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const registerUserAccount = useCallback(async (accountDetails: AccountDetails): Promise<void> => {
    await axiosClient.signUp(accountDetails);
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
