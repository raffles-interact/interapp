import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import Navbar from '@components/Navbar/Navbar';

import { AppProvider } from '@providers/index';
import Footer from '@components/Footer/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | OneInteract',
    default: 'OneInteract',
  },
  description: 'Raffles Interact web application',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Raffles',
    'RJC',
    'CCA',
    'Interact Club',
    'Interact',
    'OneInteract',
    'Raffles Interact',
    'Raffles Junior College',
    'Raffles JC',
    'RJC Interact',
    'Raffles Interact Club',
  ],
  authors: [{ name: 'Raffles Interact' }],
};

export const viewport: Viewport = {
  width: 300, // minimum width = 300px
  initialScale: 1,
  themeColor: 'white',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <ColorSchemeScript defaultColorScheme='auto' />
      </head>
      <body className={inter.className}>
        <AppProvider>
          <Navbar />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
