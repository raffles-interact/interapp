import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import Navbar from '@/components/Navbar/Navbar';

import { AppProvider } from '@/providers';
import Footer from '@/components/Footer/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Interapp',
    default: 'Interapp',
  },
  description: 'Raffles Interact web application',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'TypeScript', 'Mantine', 'Interact'],
  viewport: 'width=device-width, initial-scale=1',
  authors: [{ name: 'Raffles Interact' }],
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
