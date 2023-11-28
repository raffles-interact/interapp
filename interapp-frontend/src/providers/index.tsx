'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@providers/AuthProvider/AuthProvider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const mantineTheme = createTheme({
  defaultRadius: 'sm',
  cursorType: 'pointer',
  headings: {
    fontFamily:
      '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif ',
    fontWeight: 'medium',
  },
  primaryColor: 'blue',
  primaryShade: 6,
  other: {
    primaryColor: 'var(--mantine-color-blue-6)',
    secondaryColor: 'var(--mantine-color-teal-5)',
    tertiaryColor: 'var(--mantine-color-gray-6)',
    quartenaryColor: 'var(--mantine-color-dark-8)',
  },
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications />
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  );
};
