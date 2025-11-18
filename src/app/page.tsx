"use client";

import { motion } from "framer-motion";
import { Heart, Github, AlertCircle } from "lucide-react";
import { config } from "~/lib/config";
import Container from "~/components/ui/container";
import { animationVariants } from "~/lib/animations";
import Link from "next/link";
import Button from "~/components/ui/button";
import { useSectionSnap } from "~/hooks/useScrollBehavior";

export default function Home() {
  useSectionSnap();

  return (
    <>
      <section
        data-section
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
      >
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
        >
          <source
            src="https://r2.fuckven.co.uk/assets/SteinsGate%20Animated%20Wallpaper.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/90" />

        <motion.div
          className="absolute top-32 right-16 w-2 h-2 bg-primary/30 rounded-full blur-sm"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <Container maxWidth="2xl">
          <motion.div
            className="relative z-10 text-center"
            variants={animationVariants.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {config.features.maintenanceMode && (
              <motion.div
                variants={animationVariants.fadeInUp}
                className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20"
              >
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  Under Construction
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={animationVariants.fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              {config.site.name}
            </motion.h1>

            <motion.div
              variants={animationVariants.fadeInUp}
              className="text-lg md:text-xl font-medium mb-6 text-primary"
            >
              by{" "}
              <Link
                href="https://github.com/keircn"
                target="_blank"
                className="text-foreground hover:text-muted-foreground transition-all duration-150"
              >
                Keiran
              </Link>
            </motion.div>

            <motion.p
              variants={animationVariants.fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Share files and create short links with ease. <br /> Simple,
              secure, and private.
            </motion.p>

            <motion.div
              variants={animationVariants.fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {config.features.maintenanceMode ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap cursor-not-allowed px-6 py-3 text-lg rounded-xl h-12 gap-2 leading-none bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
                >
                  Try it out
                </button>
              ) : (
                <Button href="/dashboard" size="lg" variant="primary">
                  Try it out
                </Button>
              )}
              <Button
                href={config.social.github}
                target="_blank"
                size="lg"
                variant="outline"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <section
        data-section
        className="py-24 relative overflow-hidden bg-background min-h-screen flex items-center"
      >
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-background/60" />

        <Container maxWidth="2xl">
          <motion.div
            className="relative z-10 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Open Source</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Made by developers, for developers
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
              Proudly free and open source. Host your own instance, contribute
              to make it better, or just use it as-is. No strings attached.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button
                href={config.social.github}
                target="_blank"
                variant="primary"
                size="lg"
              >
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
              {config.features.maintenanceMode ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap cursor-not-allowed px-6 py-3 text-lg rounded-xl h-12 gap-2 leading-none border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-card/70 focus:ring-primary"
                >
                  Get Started
                </button>
              ) : (
                <Button href="/dashboard" variant="outline" size="lg">
                  Get Started
                </Button>
              )}
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
