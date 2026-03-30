import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from 'next-themes';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'المستشار AI | كوكب العدالة الرقمية',
  description: 'منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي الفائق للاستشارات والنماذج القانونية.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-primary/30 transition-colors duration-300">
        <FirebaseClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
            <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center text-[10px] md:text-xs text-primary font-black flex items-center justify-center gap-2 relative z-[110]">
              <AlertCircle className="h-3 w-3" />
              تنبيه سيادي: جميع الاستشارات المقدمة ذكية استرشادية ولا تغني عن مراجعة محامي مختص.
            </div>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}