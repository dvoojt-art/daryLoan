import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import ServiceWorker from '@/components/ServiceWorker';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'DaryLoan | Smart Loan Management',
  description: 'Automate member records, loan management, and financial reporting with DaryLoan.',

  icons: {
     icon: '/icons/iconnew-192.png',
    apple: '/icons/iconnew-192.png',
     },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
  },
};

export const viewport: Viewport = {
  themeColor: '#02277d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
        <ServiceWorker />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}