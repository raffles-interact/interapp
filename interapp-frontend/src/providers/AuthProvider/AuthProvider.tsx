import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthProviderProps, LogInDetails, AccountDetails, User, AuthContextType } from './types';
import { signIn, signUp, refreshAccessToken } from '@api/auth';

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

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (accessToken && user) {
      setUser(JSON.parse(user));
    }
    refreshAccessToken().then((accessToken) => {
      localStorage.setItem('accessToken', accessToken);
    });
    setLoading(false);
  }, []);

  const login = useCallback(async (details: LogInDetails) => {
    const { accessToken, user } = await signIn(details);

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const registerUserAccount = useCallback(async (accountDetails: AccountDetails): Promise<void> => {
    await signUp(accountDetails);
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
