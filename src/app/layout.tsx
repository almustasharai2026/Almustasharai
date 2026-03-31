import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'المستشار AI | النظام البيئي القانوني السيادي',
  description: 'منصة بيئية ذكية لاتخاذ القرار القانوني وحماية الهوية الرقمية.',
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
      <body className="antialiased selection:bg-accent/30 bg-background text-foreground">
        <FirebaseClientProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <div className="flex flex-col min-h-screen">
                <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[9px] font-black flex items-center justify-center gap-3 relative z-[150] backdrop-blur-3xl">
                  <ShieldCheck className="h-3 w-3" />
                  SOVEREIGN ENCRYPTION ACTIVE
                </div>
                <Navbar />
                <main className="flex-grow pt-20">
                  <div className="w-full max-w-full mx-auto">
                    {children}
                  </div>
                </main>
                <Footer />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
