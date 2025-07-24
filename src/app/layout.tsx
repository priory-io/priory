import type { Metadata } from "next";
import { League_Spartan, Fira_Mono } from "next/font/google";
import "./globals.css";
import { config } from "~/lib/config";
import Navbar from "~/components/navbar";

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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${leagueSpartan.variable} ${firaMono.variable} antialiased`}
      >
        <div className="min-h-screen text-foreground bg-gradient-to-br from-background via-background to-primary/5">
          <Navbar />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
