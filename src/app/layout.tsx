import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { config } from "~/lib/config";
import { ThemeProvider } from "~/components/theme-provider";
import { ToastProvider } from "~/components/ui/toast";
import { NavbarWrapper } from "~/components/navbar-wrapper";
import { SidebarProvider } from "~/components/dashboard/sidebar-context";
import { KeyboardShortcutsProvider } from "~/components/keyboard-shortcuts-provider";

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
        width: 1900,
        height: 1200,
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <KeyboardShortcutsProvider>
            <SidebarProvider>
              <ToastProvider>
                <div className="min-h-screen text-foreground bg-gradient-to-br from-background via-background to-primary/5">
                  <NavbarWrapper />
                  <main>{children}</main>
                </div>
              </ToastProvider>
            </SidebarProvider>
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
