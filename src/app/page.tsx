"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { config } from "~/lib/config";
import Container from "~/components/ui/container";
import { animationVariants } from "~/lib/animations";

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/90" />

      <motion.div
        className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full blur-sm"
        animate={{
          y: [-15, 15, -15],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 right-20 w-2 h-2 bg-accent rounded-full blur-sm"
        animate={{
          y: [15, -15, 15],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-2.5 h-2.5 bg-primary/80 rounded-full blur-sm"
        animate={{
          y: [-10, 20, -10],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <Container maxWidth="2xl">
        <motion.div
          className="relative z-10 text-center"
          variants={animationVariants.staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={animationVariants.fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold mb-6"
          >
            <span className="text-primary">{config.site.name}</span>
            <span className="text-muted-foreground/60 text-3xl md:text-5xl lg:text-6xl">
              .io
            </span>
          </motion.h1>

          <motion.div
            variants={animationVariants.fadeInUp}
            className="text-lg md:text-xl font-mono font-semibold mb-6 text-primary"
          >
            by Keiran
          </motion.div>

          <motion.p
            variants={animationVariants.fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Building Open Source Software with{" "}
            <span className="inline-flex items-center gap-1 text-destructive">
              <Heart className="w-5 h-5 translate-y-0.5" />
            </span>
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
