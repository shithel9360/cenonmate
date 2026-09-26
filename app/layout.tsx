import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cenonmate — AI Video Agency & 3D Design",
  description: "Next-Gen AI Video Editing & 3D Simulation Agency. We specialize in cinematic editing, hyper-realistic 3D product simulation, and custom generative assets.",
  metadataBase: new URL('https://cenonmate.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
  },
  openGraph: {
    title: 'Cenonmate — AI Video Agency & 3D Design',
    description: 'Next-Gen AI Video Editing & 3D Simulation Agency. We specialize in cinematic editing, hyper-realistic 3D product simulation, and custom generative assets.',
    url: 'https://cenonmate.vercel.app',
    siteName: 'Cenonmate',
    images: [
      {
        url: 'https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg',
        width: 1200,
        height: 630,
        alt: 'Cenonmate — AI Video Agency & 3D Design',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cenonmate — AI Video Agency & 3D Design',
    description: 'Next-Gen AI Video Editing & 3D Simulation Agency.',
    images: ['https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg'],
  },
  keywords: ['AI Video Editing', '3D Design', 'Video Agency', 'Cinematic Editing', 'AI Agency', 'Cenonmate', 'Video Production', '3D Product Simulation'],
  authors: [{ name: 'Cenonmate' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
