
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'المستشار AI | كوكب العدالة الرقمية',
  description: 'منصة الاستشارات القانونية السيادية المدعومة بالذكاء الاصطناعي - إصدار king2026.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-[#020617] font-sans antialiased selection:bg-primary/30">
        <FirebaseClientProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <div className="min-h-screen flex flex-col relative">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Toaster />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
