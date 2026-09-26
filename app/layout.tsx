import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cenonmate — AI Video Agency & 3D Design",
  description: "Next-Gen AI Video Editing & 3D Simulation Agency. We specialize in cinematic editing, hyper-realistic 3D product simulation, and custom generative assets.",
  openGraph: {
    title: 'Cenonmate — AI Video Agency & 3D Design',
    description: 'Next-Gen AI Video Editing & 3D Simulation Agency.',
    url: 'https://cenonmate.vercel.app',
    siteName: 'Cenonmate',
    images: [
      {
        url: 'https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg', // Default thumbnail
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
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
