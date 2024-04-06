'use client';
import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@providers/AuthProvider/AuthProvider';
import { MantineAppProvider } from './MantineAppProvider/MantineAppProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MantineAppProvider>
      <Suspense>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </MantineAppProvider>
  );
};
