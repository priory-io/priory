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
            className="relative z-10 text-center mt-[25vh]"
            variants={animationVariants.staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              variants={animationVariants.fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-semibold mb-6"
            >
              <span className="text-primary">{config.site.name}</span>
            </motion.h1>

            <motion.div
              variants={animationVariants.fadeInUp}
              className="text-lg md:text-xl font-semibold mb-8 text-primary"
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
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto justify-center"
            >
              Upload files, share links and more with Priory
            </motion.p>

            <motion.div
              variants={animationVariants.fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button href="/dashboard" size="lg" variant="primary">
                Get Started
              </Button>
              <Button
                href={config.social.github}
                target="_blank"
                size="lg"
                variant="outline"
              >
                <Github className="w-5 h-5" />
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
              Everything you need for secure sharing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with modern technologies and best practices for performance,
              security, and user experience.
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
              className="glass rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Secure File Sharing
              </h3>
              <p className="text-muted-foreground">
                Upload and share files with end-to-end encryption. Set
                expiration dates and access controls.
              </p>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Short Links</h3>
              <p className="text-muted-foreground">
                Create branded short URLs with detailed analytics and click
                tracking capabilities.
              </p>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                No tracking, no ads, no data selling. Your privacy is our
                priority with transparent practices.
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
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Open Source</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Built with{" "}
              <span className="inline-flex items-center gap-1 text-destructive">
                <Heart className="w-8 h-8 translate-y-0.5" />
              </span>{" "}
              for the community
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Completely open source and self-hostable. Contribute, customize,
              or deploy your own instance with full control over your data.
            </p>
            <Button
              href={config.social.github}
              target="_blank"
              variant="outline"
              size="lg"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
