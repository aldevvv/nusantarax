import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NusantaraX - SMEs Digital Partner",
  description: "Accelerating the Digital Revolution for Indonesian SMEs through the Power of AI Automation.",
  keywords: "SME digitalization, AI automation, digital marketing, Indonesian business, NusantaraX",
  authors: [{ name: "NusantaraX Team" }],
  creator: "NusantaraX",
  publisher: "NusantaraX",
  metadataBase: new URL('https://nusantarax.web.id'),
  
  icons: {
    icon: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png",
    shortcut: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png",
    apple: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png",
  },
  
  openGraph: {
    title: "NusantaraX - SMEs Digital Partner",
    description: "Accelerating the Digital Revolution for Indonesian SMEs through the Power of AI Automation.",
    url: 'https://nusantarax.web.id',
    siteName: 'NusantaraX',
    images: [
      {
        url: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png",
        width: 1200,
        height: 630,
        alt: 'NusantaraX - SMEs Digital Partner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "NusantaraX - SMEs Digital Partner",
    description: "Accelerating the Digital Revolution for Indonesian SMEs through the Power of AI Automation.",
    images: ["https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png"],
  },
  
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#72c306" />
        <link rel="icon" type="image/png" href="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png" />
        <link rel="shortcut icon" type="image/png" href="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png" />
        <link rel="apple-touch-icon" href="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
