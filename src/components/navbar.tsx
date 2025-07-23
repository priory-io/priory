"use client";

import Link from "next/link";
import { config } from "~/lib/config";
import logo from "~/assets/priory-logo.png";
import Image from "next/image";
import { useScrollBehavior } from "~/hooks/useScrollBehavior";

export default function Navbar() {
  const { isScrolled, isVisible } = useScrollBehavior();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
      } ${isScrolled
        ? "bg-card/95 backdrop-blur shadow"
        : "bg-transparent"
      }`}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              className="text-foreground text-2xl font-medium hover:text-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card flex items-center gap-2"
              href="/"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Image src={logo.src} alt="Priory Logo" width={64} height={64} className="rounded" />
              </div>
            </Link>
            <div className="h-6 w-px bg-muted-foreground/30 mx-4" />
            <div className="flex items-center gap-x-4">
              <Link
                className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                href={config.social.github}
                target="_blank"
              >
                GitHub
              </Link>
              <Link
                className="hover:bg-primary/15 transition-colors rounded hover:shadow px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                href={config.social.discord}
                target="_blank"
              >
                Discord
              </Link>
            </div>
          </div>
          <Link
            className="hover:scale-112 hover:rotate-2 transition-all rounded hover:shadow px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card flex items-center gap-2"
            href={config.site.repo}
            target="_blank"
            aria-label="Source code via GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
