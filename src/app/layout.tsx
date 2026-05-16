import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/UserContext";
import AppGate from "@/components/AppGate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BarConnect",
  description: "Gestión de personal para bares y restaurantes",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0058be",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-surface-white antialiased flex flex-col">
        <UserProvider>
          <AppGate>{children}</AppGate>
        </UserProvider>
      </body>
    </html>
  );
}
