import '@mantine/core/styles.css'; // import core styles first
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { ReactNode } from 'react';
import { DatesProvider } from '@mantine/dates';
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

export function MantineAppProvider({ children }: { children: Readonly<ReactNode> }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <DatesProvider settings={{ firstDayOfWeek: 0 }}>
        <Notifications />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
