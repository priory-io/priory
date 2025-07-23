import type { Metadata } from "next";
import { League_Spartan, Fira_Mono } from "next/font/google";
import "./globals.css";
import { config } from "~/lib/config";

const leagueSpartan = League_Spartan({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaMono = Fira_Mono({
  variable: "--font-mono",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.site.name,
  description: config.site.description,
  openGraph: {
    title: config.site.name,
    description: config.site.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${leagueSpartan.variable} ${firaMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
