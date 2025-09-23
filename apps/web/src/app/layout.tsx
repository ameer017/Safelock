import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '../components/navbar';
import { WalletProvider } from "../components/wallet-provider"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Safelock',
  description: 'Save smarter. Spend wiser',
  icons: {
    icon: '/images/safelock-high-resolution-logo-transparent.png',
    shortcut: '/images/safelock-high-resolution-logo-transparent.png',
    apple: '/images/safelock-high-resolution-logo-transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
