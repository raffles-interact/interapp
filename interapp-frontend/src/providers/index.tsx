'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@providers/AuthProvider/AuthProvider';
import { MantineAppProvider } from './MantineAppProvider/MantineAppProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MantineAppProvider>
      <AuthProvider>{children}</AuthProvider>
    </MantineAppProvider>
  );
};
