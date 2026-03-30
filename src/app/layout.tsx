
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from 'next-themes';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'المستشار AI | النظام البيئي القانوني السيادي',
  description: 'منصة بيئية ذكية لاتخاذ القرار القانوني، حماية الهوية الرقمية، وإدارة الوثائق السيادية.',
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
      <body className="antialiased selection:bg-primary/30 transition-colors duration-300 bg-black">
        <FirebaseClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
            <div className="bg-indigo-600/10 border-b border-white/5 py-2.5 px-4 text-center text-[9px] md:text-[10px] text-indigo-400 font-black flex items-center justify-center gap-3 relative z-[110] backdrop-blur-3xl">
              <ShieldCheck className="h-3.5 w-3.5" />
              SOVEREIGN ENCRYPTION ACTIVE · ALL DECISIONS LOGGED ON SECURE DECENTRALIZED LEDGER
            </div>
            <Navbar />
            <div className="pt-20 min-h-screen">
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
