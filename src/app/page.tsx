"use client";

import { motion } from "framer-motion";
import { Heart, Github, Upload, Link2, Shield, Zap } from "lucide-react";
import { config } from "~/lib/config";
import Container from "~/components/ui/container";
import { animationVariants } from "~/lib/animations";
import Link from "next/link";
import Button from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
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
            className="relative z-10 text-center mt-[25vh]"
            variants={animationVariants.staggerContainer}
            initial="initial"
            animate="animate"
          >
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
              Share files and create short links with ease. <br /> Simple, secure, and
              private.
            </motion.p>

            <motion.div
              variants={animationVariants.fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button href="/dashboard" size="lg" variant="primary">
                Try it out
              </Button>
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

      <section className="py-20 relative overflow-hidden bg-background">
        <Container maxWidth="2xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Simple tools for sharing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to share files and links securely, with
              privacy in mind.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="glass rounded-xl p-6 -rotate-1 border border-border text-center hover:shadow hover:bg-muted/15 hover:scale-102 hover:rotate-3 hover:-translate-y-2 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">File Sharing</h3>
              <p className="text-muted-foreground">
                Upload and share files securely. Set passwords and expiration
                dates to keep things private.
              </p>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-6 rotate-1 border border-border text-center hover:shadow hover:bg-muted/15 hover:scale-102 hover:-translate-y-2 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Short Links</h3>
              <p className="text-muted-foreground">
                Create short, clean URLs for easy sharing. Track clicks and
                manage your links from one place.
              </p>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-6 -rotate-1 border border-border text-center hover:shadow hover:bg-muted/15 hover:scale-102 hover:-rotate-3 hover:-translate-y-2 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Privacy</h3>
              <p className="text-muted-foreground">
                No ads, no tracking, no selling your data. Just simple, private
                sharing tools that respect you.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <section className="py-20 bg-background">
        <Container maxWidth="2xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-4 text-muted-foreground">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Open Source</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Made by developers, for developers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Proudly free and open source, host your own instance or contribute to make
              it even better.
            </p>
            <Button
              href={config.social.github}
              target="_blank"
              variant="outline"
              size="lg"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
