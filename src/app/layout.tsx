import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ludo Rush - The Ultimate Board Game",
  description: "Play Ludo Rush - an addictive board game with power-ups, special tiles, and exciting gameplay. Challenge AI opponents or play with friends!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ludo Rush",
  },
  openGraph: {
    title: "Ludo Rush - The Ultimate Board Game",
    description: "An addictive board game with power-ups and exciting gameplay",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
