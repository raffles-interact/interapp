'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@providers/AuthProvider/AuthProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
