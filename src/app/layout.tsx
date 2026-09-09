import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/shared/presentation/ui/primitives/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  preload: false,
});

const appDescription =
  'Seu dinheiro, seu controle, seu futuro. Organize receitas, despesas, carteira e dívidas em uma plataforma simples e objetiva.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  manifest: '/manifest.webmanifest',
  title: {
    default: 'Finance Control',
    template: '%s | Finance Control',
  },
  description: appDescription,
  applicationName: 'Finance Control',
  keywords: [
    'controle financeiro',
    'finanças pessoais',
    'receitas',
    'despesas',
    'carteira',
    'dívidas',
  ],
  creator: 'Finance Control',
  publisher: 'Finance Control',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Finance Control',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Finance Control',
    description: appDescription,
    url: '/',
    siteName: 'Finance Control',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/opengraph-image.png',
        width: 1731,
        height: 909,
        alt: 'Finance Control - Seu dinheiro, seu controle, seu futuro.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Control',
    description: appDescription,
    images: [
      {
        url: '/images/twitter-image.png',
        width: 1774,
        height: 887,
        alt: 'Finance Control - Seu dinheiro, seu controle, seu futuro.',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          {children}
          <Toaster richColors position='top-center' closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
