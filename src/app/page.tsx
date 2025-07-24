"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Mail, ArrowRight, BookOpen } from "lucide-react";
import { config } from "~/lib/config";
import { useBlogPosts } from "~/hooks/useBlogPosts";
import BlogCard from "~/components/blog/blog-card";
import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import Grid from "~/components/ui/grid";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const { posts, loading } = useBlogPosts({ featured: true });
  const featuredPosts = posts.slice(0, 2);

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
            <span className="text-primary">{config.site.name}</span>
            <span className="text-muted-foreground text-4xl md:text-6xl lg:text-7xl">
              .io
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Building the future of collaborative open source software (Coming
            Soon!!)
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 hidden" // disabling this for now :p
          >
            <Link
              href="https://github.com/keircn"
              target="_blank"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              <Github className="w-5 h-5" />
              <span>My Stuff</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="mailto:keiran@waifu.club"
              target="_blank"
              className="group inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-card/70 transition-all border border-border hover:shadow-lg hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5" />
              <span>Email Me</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {!loading && featuredPosts.length > 0 && (
        <section className="py-24 px-4">
          <Container>
            <div className="space-y-12">
              <div className="text-center space-y-6">
                <Typography
                  variant="h2"
                  className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
                >
                  Latest from the Blog
                </Typography>
                <Typography variant="lead" className="max-w-3xl mx-auto">
                  Insights and tutorials on open source development, modern web
                  technologies, and building better software.
                </Typography>
              </div>

              <Grid cols={1} responsive={{ md: 2 }} gap="lg">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} featured />
                ))}
              </Grid>

              <div className="text-center">
                <Button href="/blog" variant="outline" size="lg">
                  <BookOpen className="w-5 h-5" />
                  <span>View All Posts</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
