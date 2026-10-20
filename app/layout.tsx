import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ziteo — Your business, beautifully online",
  description: "Create your store, manage your products, and turn interest into WhatsApp conversations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
