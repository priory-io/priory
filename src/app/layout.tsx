import type { Metadata } from "next";
import { League_Spartan, Fira_Mono } from "next/font/google";
import "./globals.css";
import { config } from "~/lib/config";
import Navbar from "~/components/navbar";
import { ThemeProvider } from "~/components/theme-provider";
import { headers } from "next/headers";

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
  title: {
    default: config.site.name,
    template: `%s | ${config.site.name}`,
  },
  description: config.site.description,
  keywords: ["open source", "collaboration", "developer tools", "priory"],
  authors: [{ name: "Priory Team" }],
  creator: "Priory",
  publisher: "Priory",
  metadataBase: new URL(config.site.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: config.site.url,
    title: config.site.name,
    description: config.site.description,
    siteName: config.site.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: config.site.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: config.site.name,
    description: config.site.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${leagueSpartan.variable} ${firaMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen text-foreground bg-gradient-to-br from-background via-background to-primary/5">
            {!isDashboard && <Navbar />}
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
