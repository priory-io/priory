"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { config } from "~/lib/config";
import logo from "~/assets/priory-logo.png";
import Image from "next/image";
import { useScrollBehavior } from "~/hooks/useScrollBehavior";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { LogIn } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { UserAvatarDropdown } from "./ui/user-avatar-dropdown";

export default function Navbar() {
  const { isScrolled, isVisible } = useScrollBehavior();
  const { data: session } = authClient.useSession();

  const handleSignIn = () => {
    authClient.signIn.social({
      provider: "github",
    });
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          className={`transition-all duration-300 rounded-2xl ${
            isScrolled
              ? "bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl shadow-black/10"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link
                className="group flex items-center gap-3 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded-xl"
                href="/"
              >
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <Image
                      src={logo.src}
                      alt="Priory Logo"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </div>
                </motion.div>
                <span className="font-mono font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                  {config.site.name}
                </span>
              </Link>

              <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-6" />

              <div className="hidden md:flex items-center gap-6">
                <Link
                  className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                  href={config.social.github}
                  target="_blank"
                >
                  <div className="flex items-center gap-2">
                    <GitHubLogoIcon className="w-4 h-4" />
                    <span className="translate-y-[2px]">GitHub</span>
                  </div>
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </Link>

                <Link
                  className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                  href={config.social.discord}
                  target="_blank"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                    </svg>
                    <span className="translate-y-[2px]">Discord</span>
                  </div>
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session?.user ? (
                <UserAvatarDropdown user={session.user} />
              ) : (
                <button
                  onClick={handleSignIn}
                  className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="translate-y-[2px]">Sign In</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
