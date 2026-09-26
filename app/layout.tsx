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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://cenonmate.vercel.app/#organization',
        name: 'Cenonmate',
        url: 'https://cenonmate.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cenonmate.vercel.app/favicon-512.png',
        },
        description: 'Next-Gen AI Video Editing & 3D Simulation Agency. We specialize in cinematic editing, hyper-realistic 3D product simulation, and custom generative assets.',
        sameAs: [
          'https://www.youtube.com/@Cenonmate-z6j',
          'https://www.instagram.com/cenon_mate/',
          'https://www.facebook.com/profile.php?id=61594673284423',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Bengali'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://cenonmate.vercel.app/#website',
        url: 'https://cenonmate.vercel.app',
        name: 'Cenonmate — AI Video Agency & 3D Design',
        description: 'Next-Gen AI Video Editing & 3D Simulation Agency.',
        publisher: {
          '@id': 'https://cenonmate.vercel.app/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cenonmate.vercel.app/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfessionalService',
        '@id': 'https://cenonmate.vercel.app/#service',
        name: 'Cenonmate AI Video Agency',
        url: 'https://cenonmate.vercel.app',
        description: 'Professional AI video editing, 3D product simulation, and cinematic content creation services.',
        provider: {
          '@id': 'https://cenonmate.vercel.app/#organization',
        },
        serviceType: ['AI Video Editing', '3D Product Design', 'Cinematic Editing', 'Video Production', 'Custom Generative Assets'],
        areaServed: 'Worldwide',
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
