"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Code, Users, Zap, Mail, ArrowRight } from "lucide-react";
import { config } from "~/lib/config";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-20 w-1 h-1 bg-accent rounded-full"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary/60 rounded-full"
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl lg:text-9xl font-mono font-bold mb-6 mt-8"
          >
            <span className="text-primary">
              {config.site.name}
            </span>
            <span className="text-muted-foreground text-4xl md:text-6xl lg:text-7xl">.io</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Building the future of collaborative open source software (Coming Soon!!)
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Priory is passionate about making open source the vibrant,
            indiscriminately collaborative haven it once was. We write genuinely
            useful software and encourage community contribution.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              href="https://github.com/keircn"
              target="_blank"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              <Github className="w-5 h-5 -mt-0.5" />
              My Stuff
              <ArrowRight className="w-4 h-4 -mt-0.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="mailto:keiran@waifu.club"
              target="_blank"
              className="group inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-card/70 transition-all border border-border hover:shadow-lg hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5 -mt-0.5" />
              Email Me
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-4 hidden">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Why Open Source Matters
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building a decentralized organization of projects and libraries by the community, for the community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: "Quality Software",
                description: "We write genuinely useful software that solves real problems and stands the test of time."
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Every project encourages contribution, fostering a collaborative environment for growth."
              },
              {
                icon: Zap,
                title: "Innovation First",
                description: "Pushing boundaries and exploring new technologies to advance the open source ecosystem."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
                  <feature.icon className="w-12 h-12 text-primary mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}
