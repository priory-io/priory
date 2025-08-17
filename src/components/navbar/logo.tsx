"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import logo from "~/assets/priory-logo.svg";
import { config } from "~/lib/config";

export function Logo() {
  return (
    <Link
      className="group flex items-center gap-3 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded-xl"
      href="/"
    >
      <motion.div
        className="relative"
        whileHover={{ rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-colors hidden">
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
  );
}
