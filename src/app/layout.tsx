import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'المستشار AI | العدالة الرقمية',
  description: 'منصة الاستشارات القانونية السيادية المدعومة بالذكاء الاصطناعي.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-2xl relative flex flex-col">
                <Navbar />
                <main className="flex-grow pt-4">
                  {children}
                </main>
              </div>
            </ThemeProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}