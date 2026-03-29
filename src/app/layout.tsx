
import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'المستشار | استشارات قانونية احترافية',
  description: 'تواصل مع خبراء قانونيين للحصول على استشارات آمنة عبر الإنترنت.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
